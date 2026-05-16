const Product = require("../../models/product-model");
const calcuNewPrice = require("../../helpers/calcu-new-price");
module.exports.index = async (req, res) => {
  let find={
    deleted: false,
    status: "active",
    featured:"1"
  }
  const productsFeatured = await Product.find(find).limit(8);

  productsFeatured.forEach(item => {
    item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
  });

  res.render('client/pages/home/index',{
    pageTitle: "Trang chủ",
    categoryTree: res.locals.categoryTree,
    productsFeatured: productsFeatured
  });
}