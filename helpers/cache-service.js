const redis = require("../config/redis");
const pending = new Map();
/**
 * Lấy dữ liệu từ cache
 * @param {string} key - Cache key
 * @returns {any|null} - Parsed data hoặc null nếu miss/error
 */
const get = async (key) => {
  try {
    if (!redis.getIsConnected()) return null;
    const client = redis.getClient();
    const data = await client.get(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`[Cache] Lỗi khi GET key "${key}":`, error.message);
    return null;
  }
};

/**
 * Lưu dữ liệu vào cache
 * @param {string} key - Cache key
 * @param {any} data - Data cần cache (sẽ được JSON.stringify)
 * @param {number} ttlSeconds - Thời gian sống (giây)
 * @returns {boolean} - true nếu thành công
 */
const set = async (key, data, ttlSeconds = 300) => {
  try {
    if (!redis.getIsConnected()) return false;
    const client = redis.getClient();
    await client.setex(key, ttlSeconds, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`[Cache] Lỗi khi SET key "${key}":`, error.message);
    return false;
  }
};

/**
 * Xóa một cache key cụ thể
 * @param {string} key - Cache key cần xóa
 * @returns {boolean}
 */
const del = async (key) => {
  try {
    if (!redis.getIsConnected()) return false;
    const client = redis.getClient();
    await client.del(key);
    console.log(`[Cache] DEL: ${key}`);
    return true;
  } catch (error) {
    console.error(`[Cache] Lỗi khi DEL key "${key}":`, error.message);
    return false;
  }
};

/**
 * Xóa tất cả cache keys theo pattern
 * Sử dụng SCAN thay vì KEYS để tránh blocking Redis
 * @param {string} pattern - Pattern (vd: "products:*")
 * @returns {number} - Số keys đã xóa
 */
const delByPattern = async (pattern) => {
  try {
    if (!redis.getIsConnected()) return 0;
    const client = redis.getClient();
    let cursor = "0";
    let totalDeleted = 0;

    do {
      const [newCursor, keys] = await client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = newCursor;

      if (keys.length > 0) {
        await client.unlink(...keys); // UNLINK non-blocking, tốt hơn DEL
        totalDeleted += keys.length;
      }
    } while (cursor !== "0");

    if (totalDeleted > 0) {
      console.log(
        `[Cache] INVALIDATE: Pattern "${pattern}" — Đã xóa ${totalDeleted} keys`
      );
    }
    return totalDeleted;
  } catch (error) {
    console.error(
      `[Cache] Lỗi khi xóa pattern "${pattern}":`,
      error.message
    );
    return 0;
  }
};

/**
 * Cache-aside pattern: check cache → nếu miss thì gọi fetchFn → set cache → return
 * @param {string} key - Cache key
 * @param {number} ttlSeconds - Thời gian sống (giây)
 * @param {Function} fetchFn - Async function để fetch data khi cache miss
 * @returns {any} - Data từ cache hoặc từ fetchFn
 */
const getOrSet = async (key, ttlSeconds, fetchFn) => {
  // Thử lấy từ cache trước
  const cached = await get(key);
  if (cached !== null) {
    return cached;
  }

  if (pending.has(key)) {
    return pending.get(key);
  }

  const request = (async () => {
    const freshData = await fetchFn();
    await set(key, freshData, ttlSeconds);
    return freshData;
  })();

  pending.set(key, request);

  try {
    return await request;
  } finally {
    pending.delete(key);
  }
};

/**
 * Kiểm tra Redis có hoạt động không
 * @returns {boolean}
 */
const isHealthy = () => {
  return redis.getIsConnected();
};

module.exports = {
  get,
  set,
  del,
  delByPattern,
  getOrSet,
  isHealthy,
};
