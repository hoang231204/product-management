const Category = require('../../models/product-category-model');
const tree = require('../../helpers/create-tree');
const cacheService = require('../../helpers/cache-service');

module.exports.category = async (req, res, next) =>{
    try {
        const cachedData = await cacheService.getOrSet(
            "categories:tree",
            900,
            async () => {
                const categories = await Category.find({deleted: false})
                    .select('title slug parent_id status')
                    .lean();
                return {
                    categories,
                    categoryTree: tree(categories)
                };
            }
        );

        res.locals.categories = cachedData.categories;
        res.locals.categoryTree = cachedData.categoryTree;
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