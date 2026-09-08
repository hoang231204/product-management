const Product = require("../../models/product-model");
const calcuNewPrice = require("../../helpers/calcu-new-price");
const cacheService = require("../../helpers/cache-service");

module.exports.index = async (req, res) => {
  try{
    // Cache sản phẩm featured và latest riêng biệt
    const [productsFeatured, latestProducts] = await Promise.all([
      cacheService.getOrSet(
        "products:featured",
        300,
        async () => {
          const data = await Product.find({featured: "1"}).limit(4).lean();
          data.forEach(item => {
            item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
          });
          return data;
        }
      ),
      cacheService.getOrSet(
        "products:latest",
        300,
        async () => {
          const data = await Product.find({
            deleted: false,
            status: "active",
            stock: { $gt: 0 },
            featured: "0"
          }).sort({createdAt: -1}).limit(8).lean();
          data.forEach(item => {
            item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
          });
          return data;
        }
      )
    ]);

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