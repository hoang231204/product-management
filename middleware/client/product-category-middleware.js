const Category = require('../../models/product-category-model');
const tree = require('../../helpers/create-tree');
const cacheService = require('../../helpers/cache-service');

module.exports.category = async (req, res, next) =>{
    try {
        // Cache cây danh mục — chạy trên MỌI request client nên impact rất lớn
        const cacheKey = "categories:tree";
        const cachedData = await cacheService.get(cacheKey);

        if (cachedData) {
            res.locals.categories = cachedData.categories;
            res.locals.categoryTree = cachedData.categoryTree;
            return next();
        }

        const categories = await Category.find({deleted: false}).select('title slug parent_id status').lean();
        if(!categories) {
            return next();
        }
        const categoryTree = tree(categories);
        res.locals.categories = categories;
        res.locals.categoryTree = categoryTree;

        // Lưu cache 15 phút
        await cacheService.set(cacheKey, { categories, categoryTree }, 900);
        next();
    } catch (error) {
        // Fallback: query trực tiếp nếu có lỗi
        const categories = await Category.find({deleted: false}).select('title slug parent_id status').lean();
        if(categories) {
            res.locals.categories = categories;
            res.locals.categoryTree = tree(categories);
        }
        next();
    }
}