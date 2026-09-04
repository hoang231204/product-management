const redis = require('../config/redis');

const WINDOW_SECONDS = 60;
const MAX_FILES_PER_WINDOW = 2;
const localCounters = new Map();

const getFileCount = (req) => {
  if (req.file) return 1;
  if (!req.files) return 0;

  if (Array.isArray(req.files)) return req.files.length;

  return Object.values(req.files).reduce(
    (total, files) => total + (Array.isArray(files) ? files.length : 0),
    0
  );
};

const getClientKey = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const windowId = Math.floor(Date.now() / (WINDOW_SECONDS * 1000));
  return `rate-limit:cloudinary-upload:${ip}:${windowId}`;
};

const consumeLocalQuota = (key, fileCount) => {
  const now = Date.now();
  const current = localCounters.get(key);

  if (!current || current.expiresAt <= now) {
    const next = { count: fileCount, expiresAt: now + WINDOW_SECONDS * 1000 };
    localCounters.set(key, next);
    return next.count;
  }

  current.count += fileCount;
  return current.count;
};

module.exports = async (req, res, next) => {
  const fileCount = getFileCount(req);

  if (fileCount === 0) return next();

  const key = getClientKey(req);
  let totalFiles;

  try {
    const client = redis.getClient();

    if (redis.getIsConnected() && client) {
      totalFiles = await client.incrby(key, fileCount);
      if (totalFiles === fileCount) {
        await client.expire(key, WINDOW_SECONDS + 1);
      }
    } else {
      totalFiles = consumeLocalQuota(key, fileCount);
    }
  } catch (error) {
    console.error('[Upload rate limit] Redis unavailable, using local counter:', error.message);
    totalFiles = consumeLocalQuota(key, fileCount);
  }

  if (totalFiles > MAX_FILES_PER_WINDOW) {
    return res.status(429).send('Upload limit exceeded. You can upload up to 2 files per minute.');
  }

  next();
};

module.exports.getFileCount = getFileCount;
module.exports.limits = {
  windowSeconds: WINDOW_SECONDS,
  maxFiles: MAX_FILES_PER_WINDOW
};
