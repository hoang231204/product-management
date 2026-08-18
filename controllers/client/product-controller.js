const Product = require("../../models/product-model")
const calcuNewPrice = require("../../helpers/calcu-new-price");
const getChildrenCategories = require("../../helpers/get-children");
const pagination = require("../../helpers/pagination");
module.exports.index = async (req, res) => {
  try {
    let find = {
      deleted: false,
      status: "active"
    }
    const countData = await Product.find(find).countDocuments();
    const objectPagination = pagination(req.query,countData, 8);
    const products = await Product.find(find).skip(objectPagination.skipPage).limit(objectPagination.limitPage).sort({ position: -1 });
    products.forEach(item => {
      item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
    })

    res.render('client/pages/products/index', {
      pageTitle: "Danh sách sản phẩm",
      products: products,
      category: null,
      categoryTree: res.locals.categoryTree,
      objectPagination: objectPagination
    })
  }
  catch (error) {
    req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
    res.redirect('/products');
  }
}

module.exports.category = async (req, res) => {
  const slugCategory = req.params.slugCategory;
  const categories = res.locals.categories;
  const category = categories.find(item => item.slug === slugCategory);
  if (!category) {
    return res.redirect('/products');
  }
  const categoryIds = getChildrenCategories(categories, category._id);
  categoryIds.push(category._id.toString());

  try {
    let find = {
      category_id: { $in: categoryIds }
    };
    const countData = await Product.find(find).countDocuments();
    const objectPagination = pagination(req.query,countData, 8);
    const products = await Product.find(find).skip(objectPagination.skipPage).limit(objectPagination.limitPage).sort({ position: -1 });
    products.forEach(item => {
      item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
    })

    res.render('client/pages/products/index', {
      pageTitle: category.title,
      products: products,
      category: category,
      categoryTree: res.locals.categoryTree,
      objectPagination: objectPagination
    });
  }
  catch (error) {
    req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
    res.redirect('/products');
  }
}

module.exports.details = async (req, res) => {
  try {
    const slugProduct = req.params.slugProduct;
    const product = await Product.findOne({
      slug: slugProduct,
      deleted: false,
      status: "active",
      stock: { $gt: 0 }
    }).populate('category_id', 'title slug');

    if (!product) {
      req.flash('error', 'Sản phẩm không tồn tại');
      return res.redirect('/products');
    }

    const priceNew = calcuNewPrice.priceNew(product.price, product.discountPercentage);
    product.priceNew = priceNew;

    res.render('client/pages/products/details', {
      pageTitle: product.title,
      product: product,
      category: product.category || null
    });
  }
  catch (error) {
    req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
    res.redirect('/products');
  }
}
