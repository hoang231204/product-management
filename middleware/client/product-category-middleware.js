const Category = require('../../models/product-category-model');
const tree = require('../../helpers/create-tree');
module.exports.category = async (req, res, next) =>{
    const categories = await Category.find({deleted: false}).select('title slug parent_id').lean();
    if(!categories) {
        return next();
    }
    const categoryTree = tree(categories);
    res.locals.categories = categories;
    res.locals.categoryTree = categoryTree;
    next();
}