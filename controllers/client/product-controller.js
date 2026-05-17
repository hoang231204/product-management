const Product = require("../../models/product-model")
const calcuNewPrice = require("../../helpers/calcu-new-price");
const getChildrenCategories = require("../../helpers/get-children");
module.exports.index =  async (req, res) => {
  let find = {
    deleted:false
  }
  const products = await Product.find(find).sort({position:-1});
  products.forEach(item => {
    item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
  })
 
  res.render('client/pages/products/index',{
    pageTitle:"Danh sách sản phẩm",
    products: products,
    categoryTree: res.locals.categoryTree
  })
}
module.exports.category = async (req, res) => {
  const slugCategory = req.params.slugCategory;
  const categories = res.locals.categories;
  const category = categories.find(item => item.slug === slugCategory);
  if(!category) {
    return res.redirect('/products');
  }
  const categoryIds = getChildrenCategories(res.locals.categories, category.id);
  categoryIds.push(category._id);
  const products = await Product.find({
    category_id: { $in: categoryIds },
    deleted: false,
    status: "active"
  }).sort({position:-1});
  res.render('client/pages/products/index', {
    pageTitle: category.title,
    products: products,
    categoryTree: res.locals.categoryTree
  });
}
module.exports.details = async (req, res) => {
  const slugProduct = req.params.slugProduct;
  const product = await Product.findOne({slug: slugProduct, deleted: false}).populate('category', 'title slug').lean();
  const priceNew = calcuNewPrice.priceNew(product.price, product.discountPercentage);
  product.priceNew = priceNew;
  res.render('client/pages/products/details', {
    pageTitle: product.title,
    product: product
  });
}