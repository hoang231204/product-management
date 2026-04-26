const Product = require("../../models/product-model")
module.exports.index =  async (req, res) => {
  let find = {
    delete: false
  }
  const products = await Product.find(find).sort({position:-1});
  products.forEach(item => {
    item.priceNew = (item.price*(100 - item.discountPercentage)/100).toFixed(0);
  })
 
  res.render('client/pages/products/index',{
    pageTitle:"Danh sách sản phẩm",
    products: products,
  })
}
module.exports.details = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug,
      delete: false,
      status: "active"
    });
    
    if (!product) {
      return res.status(404).render('client/pages/404', {
        pageTitle: "Sản phẩm không tìm thấy"
      });
    }

    res.render('client/pages/products/details', {
      pageTitle: product.title,
      product: product
    });
  } catch (error) {
    res.status(500).render('client/pages/500', {
      pageTitle: "Lỗi server"
    });
  }
}