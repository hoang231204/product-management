const Redis = require("ioredis");

let client = null;
let isConnected = false;

/**
 * Khởi tạo Redis client
 * Graceful degradation: nếu Redis không available, hệ thống vẫn chạy bình thường
 */
const connect = () => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 10) {
        console.warn("[Redis] Đã vượt quá số lần retry tối đa. Dừng reconnect.");
        return null;
      }
      const delay = Math.min(times * 500, 5000);
      console.log(`[Redis] Retry kết nối lần ${times} sau ${delay}ms...`);
      return delay;
    },
    lazyConnect: false,
    enableOfflineQueue: false,
  });

  client.on("connect", () => {
    isConnected = true;
    console.log("[Redis] Kết nối thành công!");
  });

  client.on("ready", () => {
    isConnected = true;
    console.log("[Redis] Sẵn sàng nhận lệnh.");
  });

  client.on("error", (err) => {
    isConnected = false;
    console.error("[Redis] Lỗi:", err.message || err.code || err);
  });

  client.on("close", () => {
    isConnected = false;
    console.warn("[Redis] Kết nối đã đóng.");
  });

  client.on("reconnecting", () => {
    console.log("[Redis] Đang thử kết nối lại...");
  });

  client.on("end", () => {
    isConnected = false;
    console.warn("[Redis] Client đã ngắt kết nối hoàn toàn.");
  });

  return client;
};

/**
 * Lấy Redis client instance
 */
const getClient = () => client;

/**
 * Kiểm tra Redis có đang kết nối không
 */
const getIsConnected = () => isConnected;

/**
 * Đóng kết nối Redis (graceful shutdown)
 */
const disconnect = async () => {
  if (client) {
    await client.quit();
    isConnected = false;
    console.log("[Redis] Đã đóng kết nối.");
  }
};

module.exports = {
  connect,
  getClient,
  getIsConnected,
  disconnect,
};
