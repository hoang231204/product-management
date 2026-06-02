const Post = require('../../models/post-model');
const PostCategory = require('../../models/post-category-model');
const filter = require('../../helpers/filter-category')
const pagination = require('../../helpers/pagination');
//GET /blogs
module.exports.index = async (req, res) =>{
    try{
        const categories = filter(req.query);
        let find={
            status: 'active',
            deleted: false
        }
        if(req.query.slugCategory){
            const category = await PostCategory.findOne({slug: req.query.slugCategory}).lean();
            if(category){
                find.category = category._id;
            } else {
            req.flash('error', 'Danh mục không tồn tại');
            return res.redirect('/blogs');
            }
        }
        else{
            find.featured = '1';
        }
        const count = await Post.countDocuments(find);
        const objectPagination = pagination(req.query, count);
        const blogs = await Post.find(find).skip(objectPagination.skipPage).limit(objectPagination.limitPage).lean();
        res.render('client/pages/blog/index', {
            pageTitle: 'Danh sách bài viết',
            categories: categories,
            blogs: blogs,
            objectPagination: objectPagination
        });
    }
    catch(err){
        req.flash('error', 'Đã có lỗi xảy ra');
        res.redirect('/blogs');
    }
}
//GET /blogs/details/:slugBlog
module.exports.details = async (req, res) =>{
    try{
        const slugBlog = req.params.slugBlog;
    const blog = await Post.findOne({slug: slugBlog}).lean();
        res.render('client/pages/blog/details', {
            pageTitle: 'Chi tiết bài viết',
            blog: blog
        });
    }
    catch(err){
        req.flash('error', 'Đã có lỗi xảy ra');
        res.redirect('/blogs');
    }
}