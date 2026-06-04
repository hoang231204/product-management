const Order = require('../../models/order-model');
const Product = require('../../models/product-model');
const ProductCategory = require('../../models/product-category-model');
const Account = require('../../models/account-model');
const User = require('../../models/user-model');
module.exports.dashboard = async (req, res) => {
  try {
    const statistic = {
      categoryProduct: {
        total: 0,
        active: 0,
        inactive: 0,
      },
      product: {
        total: 0,
        active: 0,
        inactive: 0,
      },
      account: {
        total: 0,
        active: 0,
        inactive: 0,
      },
      user: {
        total: 0,
        active: 0,
        inactive: 0,
      },
    };
    const categories = await ProductCategory.find();
    statistic.categoryProduct.total = categories.length;
    statistic.categoryProduct.active = categories.filter(c => c.status === 'active').length;
    statistic.categoryProduct.inactive = categories.filter(c => c.status === 'inactive').length;
    const products = await Product.find();
    statistic.product.total = products.length;
    statistic.product.active = products.filter(p => p.status === 'active').length;
    statistic.product.inactive = products.filter(p => p.status === 'inactive').length;
    const accounts = await Account.find();
    statistic.account.total = accounts.length;
    statistic.account.active = accounts.filter(a => a.status === 'active').length;
    statistic.account.inactive = accounts.filter(a => a.status === 'inactive').length;
    const users = await User.find();
    statistic.user.total = users.length;
    statistic.user.active = users.filter(u => u.status === 'active').length;
    statistic.user.inactive = users.filter(u => u.status === 'inactive').length;
    const selectedYear = parseInt(req.query.year) || new Date().getFullYear();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const startOfYear = new Date(selectedYear, 0, 1);
    const endOfYear = new Date(selectedYear + 1, 0, 1);
    const totalOrders = await Order.countDocuments();
    const ordersToday = await Order.countDocuments({ createdAt: { $gte: startOfToday } });
    const ordersMonth = await Order.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const monthRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const yearRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear, $lt: endOfYear } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const revenueDataRaw = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear, $lt: endOfYear } } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$total" } } }
    ]);
    const revenueChart = Array(12).fill(0);
    revenueDataRaw.forEach(item => { revenueChart[item._id - 1] = item.total; });
    const bestSeller = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear, $lt: endOfYear } } },
      { $unwind: "$products" },
      { $group: { _id: "$products.product_id", totalSold: { $sum: "$products.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 1 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productInfo" } },
      { $unwind: "$productInfo" }
    ]);
    const thisDay = new Date();
    res.render('admin/pages/dashboard/index', {
      pageTitle: "Trang Tổng Quan",
      selectedYear,
      totalOrders,
      ordersToday,
      ordersMonth,
      pendingOrders,
      todayRevenue: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
      monthRevenue: monthRevenue.length > 0 ? monthRevenue[0].total : 0,
      yearRevenue: yearRevenue.length > 0 ? yearRevenue[0].total : 0,
      revenueChart,
      bestSeller: bestSeller.length > 0 ? bestSeller[0] : null,
      thisDay:thisDay.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }),
      statistic
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};