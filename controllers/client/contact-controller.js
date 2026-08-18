module.exports.index = async (req, res) => {
  try {
    res.render('client/pages/contact/index', {
        pageTitle: "Liên hệ",
        categoryTree: res.locals.categoryTree
    });
  }
    catch (error) {
    req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
    res.redirect('/');
  }
}