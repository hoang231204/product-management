const Regex = require('../../helpers/search')
const Product = require("../../models/product-model")
module.exports.index =  async (req, res) => {
    try{
        if(req.query.keyword){
        const keyword = req.query.keyword;
        const regex = Regex(keyword);
        const products = await Product.find({
            title: regex,
            deleted: false
        }).sort({position:-1});
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