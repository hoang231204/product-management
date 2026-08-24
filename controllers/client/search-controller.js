const Regex = require('../../helpers/search')
const Product = require("../../models/product-model")
const cacheService = require("../../helpers/cache-service");

module.exports.index =  async (req, res) => {
    try{
        if(req.query.keyword){
        const keyword = req.query.keyword;
        // Tạo cache key an toàn từ keyword (loại bỏ ký tự đặc biệt)
        const safeKeyword = keyword.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF ]/g, '').substring(0, 100);
        const cacheKey = `products:search:${safeKeyword}`;

        const cachedProducts = await cacheService.get(cacheKey);
        if (cachedProducts) {
            return res.render('client/pages/products/index', {
                pageTitle: `"${keyword}"| Tìm kiếm`,
                products: cachedProducts,
                categoryTree: res.locals.categoryTree
            });
        }

        const regex = Regex(keyword);
        const products = await Product.find({
            title: regex,
            deleted: false
        }).sort({position:-1}).lean();

        // Cache 3 phút (keyword đa dạng nên TTL ngắn)
        await cacheService.set(cacheKey, products, 180);

        res.render('client/pages/products/index', {
            pageTitle: `"${keyword}"| Tìm kiếm`,
            products: products,
            categoryTree: res.locals.categoryTree
        });
        }else{
            res.redirect('/products');
        }
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/products');
    }
}