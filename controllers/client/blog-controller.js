const Post = require('../../models/post-model');
const PostCategory = require('../../models/post-category-model');
const filter = require('../../helpers/filter-category');
const pagination = require('../../helpers/pagination');
const cacheService = require('../../helpers/cache-service');

// GET /blogs
module.exports.index = async (req, res) => {
  try {
    const categories = await filter(req.query);
    let find = {
      status: 'active',
      deleted: false
    };

    let cacheKeySuffix = '';

    if (req.query.slugCategory) {
      const category = await PostCategory.findOne({
        slug: req.query.slugCategory,
        deleted: false,
        status: 'active'
      }).lean();

      if (!category) {
        req.flash('error', 'Danh mục không tồn tại');
        return res.redirect('/blogs');
      }

      find.category_id = category._id;
      cacheKeySuffix = `:cat:${req.query.slugCategory}`;
    } else {
      cacheKeySuffix = ':all';
    }

    const page = req.query.page || 1;
    const cacheKey = `blogs:list${cacheKeySuffix}:page:${page}`;

    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.render('client/pages/blog/index', {
        pageTitle: 'Danh sách bài viết',
        categories: categories,
        blogs: cachedData.blogs,
        objectPagination: cachedData.objectPagination
      });
    }

    const count = await Post.countDocuments(find);
    const objectPagination = pagination(req.query, count);
    const blogs = await Post.find(find)
      .sort({ createdAt: -1 })
      .skip(objectPagination.skipPage)
      .limit(objectPagination.limitPage)
      .lean();

    // Cache 5 phút
    await cacheService.set(cacheKey, { blogs, objectPagination }, 300);

    res.render('client/pages/blog/index', {
      pageTitle: 'Danh sách bài viết',
      categories: categories,
      blogs: blogs,
      objectPagination: objectPagination
    });
  }
  catch (err) {
    req.flash('error', 'Đã có lỗi xảy ra');
    res.redirect('/blogs');
  }
};

// GET /blogs/details/:slugBlog
module.exports.details = async (req, res) => {
  try {
    const slugBlog = req.params.slugBlog;
    const cacheKey = `blogs:detail:${slugBlog}`;

    const cachedBlog = await cacheService.get(cacheKey);
    if (cachedBlog) {
      return res.render('client/pages/blog/details', {
        pageTitle: cachedBlog.title,
        blog: cachedBlog
      });
    }

    const blog = await Post.findOne({
      slug: slugBlog,
      deleted: false,
      status: 'active'
    })
      .populate('category_id', 'title slug')
      .lean();

    if (!blog) {
      req.flash('error', 'Bài viết không tồn tại');
      return res.redirect('/blogs');
    }

    blog.category = blog.category_id || null;

    // Cache 10 phút
    await cacheService.set(cacheKey, blog, 600);

    res.render('client/pages/blog/details', {
      pageTitle: blog.title,
      blog: blog
    });
  }
  catch (err) {
    req.flash('error', 'Đã có lỗi xảy ra');
    res.redirect('/blogs');
  }
};