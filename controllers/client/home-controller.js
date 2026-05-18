const Product = require("../../models/product-model");
const calcuNewPrice = require("../../helpers/calcu-new-price");
module.exports.index = async (req, res) => {
  let find={
    deleted: false,
    status: "active",
    featured:"1",
    stock: {$gt: 0}
  }
  const productsFeatured = await Product.find(find).limit(6);
  productsFeatured.forEach(item => {
    item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
  });
  const latestProducts = await Product.find(find).sort({position: "desc"}).limit(6);
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