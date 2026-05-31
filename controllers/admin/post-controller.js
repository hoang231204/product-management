const Post = require('../../models/post-model');
const filter = require('../../helpers/filter-status');
const search = require('../../helpers/search');
const pagination = require('../../helpers/pagination');
const systemConfig = require('../../config/system');
//GET /posts
module.exports.index = async (req, res) => {
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("blog_view")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/posts`)
    }
    const filterStatus = filter(req.query, 'blog');
    const regex = search(req.query);
    let find = {};
    find.deleted = false;
    if (req.query.status) {
        find.status = req.query.status;
    }
    if (req.query.keyword) {
        find.title = regex;
    }
    const countData = await Post.find(find).countDocuments(find);
    const objectPagination = pagination(req.query,countData)
    let sort={};
    if(req.query.sortBy && req.query.sortType){
        sort[req.query.sortBy] = req.query.sortType;
    }
    else{
        sort.position = -1;
    }
    try {
        const posts = await Post
            .find(find)
            .sort(sort)
            .limit(objectPagination.limitPage)
            .skip(objectPagination.skipPage)
            .populate("category_id","title")
            .populate("createdBy.account_id","fullname")
            .populate("updatedBy.account_id","fullname")
            .lean()
        res.render('admin/pages/post/index', {
            pageTitle: "Danh sách bài viết",
            posts: posts,
            filterStatus: filterStatus,
            keyword: req.query.keyword,
            objectPagination: objectPagination
    });
    } catch (error) {
        console.log(error);
        req.flash("error","Có lỗi xảy ra trong quá trình xử lý!")
        res.redirect(`${systemConfig.prefixAdmin}/posts`)
    } 
}
//GET /posts/details/:id
module.exports.details = async (req, res) =>{
    try{
        const permissions = res.locals.role.permissions;
            if(!permissions.includes("blog_view")){
                req.flash("error","Bạn không có quyền thực hiện chức năng này!")
                return res.redirect(`${systemConfig.prefixAdmin}/posts`)
            }
            const post = await Post
                .findOne({ _id: req.params.id }) 
                .populate("category_id", "title")
                .populate("createdBy.account_id", "fullname")
                .populate("updatedBy.account_id", "fullname")
                .lean();
            if (!post) {
                req.flash("error", "Bài viết không tồn tại!");
                return res.redirect(`${systemConfig.prefixAdmin}/posts`);
            }
            const categoryTitle = post.category_id ? post.category_id.title : "Không có danh mục";
            res.render("admin/pages/post/details", {
                pageTitle: post.title,
                post: post,
                categoryTitle: categoryTitle
            });
    }
    catch(error){
        console.log(error);
        req.flash("error","Có lỗi xảy ra trong quá trình xử lý!")
        res.redirect(`${systemConfig.prefixAdmin}/posts`)
    }
}