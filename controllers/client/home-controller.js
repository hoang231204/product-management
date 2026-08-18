const Product = require("../../models/product-model");
const calcuNewPrice = require("../../helpers/calcu-new-price");
module.exports.index = async (req, res) => {
  try{
    let find={
      deleted: false,
      status: "active",
      stock: { $gt: 0 },
      featured: "0"
    }
    const productsFeatured = await Product.find({featured: "1"}).limit(4);
    productsFeatured.forEach(item => {
      item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
    });
    const latestProducts = await Product.find(find).sort({createdAt: -1}).limit(8);
    latestProducts.forEach(item => {
      item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
    });
    res.render('client/pages/home/index',{
      pageTitle: "Trang chủ",
      categoryTree: res.locals.categoryTree,
      productsFeatured: productsFeatured,
      latestProducts: latestProducts
    });
  }
  catch(error){
    req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
    res.redirect('/products');
  }
}