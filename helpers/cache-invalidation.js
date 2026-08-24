const cacheService = require("./cache-service");

/**
 * Cache Invalidation Helpers
 * Tập trung logic invalidation thành các hàm semantic theo domain
 */

/**
 * Invalidate tất cả cache liên quan đến sản phẩm
 * Gọi khi: tạo/sửa/xóa/đổi trạng thái sản phẩm
 */
const invalidateProducts = async () => {
  console.log("[Invalidation] Xóa cache sản phẩm...");
  await cacheService.delByPattern("products:*");
};

/**
 * Invalidate tất cả cache liên quan đến danh mục + sản phẩm
 * Gọi khi: tạo/sửa/xóa/đổi trạng thái danh mục
 * Phải xóa cả products vì sản phẩm phụ thuộc vào danh mục (category tree, filter theo danh mục)
 */
const invalidateCategories = async () => {
  console.log("[Invalidation] Xóa cache danh mục & sản phẩm liên quan...");
  await Promise.all([
    cacheService.delByPattern("categories:*"),
    cacheService.delByPattern("products:*"),
  ]);
};

/**
 * Invalidate tất cả cache liên quan đến bài viết/blog
 * Gọi khi: tạo/sửa/xóa/đổi trạng thái bài viết
 */
const invalidateBlogs = async () => {
  console.log("[Invalidation] Xóa cache bài viết...");
  await cacheService.delByPattern("blogs:*");
};

/**
 * Invalidate cache cài đặt website
 * Gọi khi: cập nhật thông tin website
 */
const invalidateSettings = async () => {
  console.log("[Invalidation] Xóa cache cài đặt...");
  await cacheService.delByPattern("settings:*");
};

/**
 * Invalidate cache dashboard thống kê
 * Gọi khi: tạo/cập nhật đơn hàng
 */
const invalidateDashboard = async () => {
  console.log("[Invalidation] Xóa cache dashboard...");
  await cacheService.delByPattern("dashboard:*");
};

/**
 * Invalidate toàn bộ cache (nuclear option)
 * Chỉ dùng khi thực sự cần thiết
 */
const invalidateAll = async () => {
  console.log("[Invalidation] Xóa TOÀN BỘ cache...");
  await Promise.all([
    invalidateProducts(),
    invalidateCategories(),
    invalidateBlogs(),
    invalidateSettings(),
    invalidateDashboard(),
  ]);
};

module.exports = {
  invalidateProducts,
  invalidateCategories,
  invalidateBlogs,
  invalidateSettings,
  invalidateDashboard,
  invalidateAll,
};
