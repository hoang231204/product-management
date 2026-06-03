const PostCategory = require("../../models/post-category-model");
const systemConfig = require("../../config/system")
const tree = require("../../helpers/create-tree");
const filter = require("../../helpers/filter-status")
const keyword = require("../../helpers/search");
const getChildren = require("../../helpers/get-children")
const checkStatusParents = require("../../helpers/check-status-parent");
const checkStatusParentsMulti = require("../../helpers/check-status-parents-multi");
const changeStatusCategory = require("../../helpers/change-status-category");
//GET /categories
module.exports.index =async (req,res)=>{
    try{
        const permissions = res.locals.role.permissions;
        if(!permissions.includes("post_category_view")){
            req.flash("error","Bạn không có quyền thực hiện chức năng này!")
            return res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
        }
        const filterStatus = filter(req.query,"category");
        const regex = keyword(req.query);
        let find={
            deleted: false
        };
        if(req.query.status){
            find.status = req.query.status;
        }
        if(req.query.keyword){
            find.title = regex;
        }
        const categories = await PostCategory
            .find(find)
            .populate("createdBy.account_id","fullname")
            .populate("updatedBy.account_id","fullname")
            .lean();
        const categoryTree = tree(categories);
        res.render("admin/pages/post-category/index",{
            pageTitle:"Danh mục bài viết",
            categories: categories,
            categoryTree: categoryTree,
            filterStatus: filterStatus
        })
    }
    catch(error){
        req.flash("error","Có lỗi xảy ra khi tải danh sách danh mục!")
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
}
//GET /create
module.exports.create =async (req,res)=>{
    try{
        let find = {
        deleted: false,
        status: "active"
        }
        const categories =await PostCategory.find();
        const categoryTree = tree(categories);
        res.render("admin/pages/post-category/create",{
            pageTitle:"Tạo danh mục bài viết",
            categoryTree: categoryTree
        })
    }
    catch(error){
        req.flash("error","Có lỗi xảy ra!")
        res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
    }
}
//POST /create
module.exports.createPost = async (req,res)=>{
    const permissions = res.locals.role.permissions; 
    if(!permissions.includes("post_category_create")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
    }
    const count = await PostCategory.countDocuments();
    if(req.body.position ==''){
        req.body.position = count + 1;
    }
    if(req.body.parent_id == ""){
        req.body.parent_id = null;
    }
    req.body.createdBy = {
        account_id: res.locals.user._id,
        createdAt: new Date()
    };
    try{
        const category = new PostCategory(req.body);
        await category.save();
        req.flash('success', 'Tạo danh mục thành công!');
    }
    catch(error){
        req.flash('error', 'Có lỗi xảy ra khi tạo danh mục!');
    }
    res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
}
//PATCH /change-status/:status/:id
module.exports.changeStatus = async (req,res)=>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("post_category_edit")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
    }
    const id = req.params.id;
    const status = req.params.status;
    let find={
        deleted: false,
    }
    const categories = await PostCategory.find(find);
    let ids = changeStatusCategory(categories, status, id, req, res);
    if(!ids){
        req.flash("error", "Không thể kích hoạt danh mục khi danh mục cha chưa được kích hoạt!");
        const backUrl = req.get("Referrer");
        return res.redirect(backUrl);
    }
    let updatedBy = {
        account_id: res.locals.user._id,
        updatedAt: new Date()
    };
    try{
        await PostCategory.updateMany({_id: {$in: ids}}, {status: status, $push: { updatedBy: updatedBy }});
        req.flash("success", "Cập nhật trạng thái danh mục thành công!");
    }
    catch(error){
        req.flash("error", "Có lỗi xảy ra khi cập nhật trạng thái danh mục!");
    }
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//PATCH /delete/:id
module.exports.delete = async (req,res)=>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("post_category_delete")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
    }
    const id = req.params.id;
    let ids=[];
    ids.push(id);
    const categories = await PostCategory.find({deleted: false});
    const childrenId = getChildren(categories, id);
    ids.push(...childrenId);
    try{
        await PostCategory.updateMany(
        {
            _id: {$in: ids}
        },
        {
            $set: {
                deleted: true,
                deletedBy: {
                    account_id: res.locals.user._id,
                    deletedAt: new Date()
                }
            }
        }
        );
        req.flash("success", "Xóa danh mục thành công!")
    }
    catch(error){
        req.flash("error", "Có lỗi xảy ra khi xóa danh mục!")
    }
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//GET details/:id
module.exports.details = async (req,res)=>{
    try{
        const permissions = res.locals.role.permissions;
        if(!permissions.includes("post_category_view")){
            req.flash("error","Bạn không có quyền thực hiện chức năng này!")
            return res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
        }
        const id = req.params.id;
        let find={
            deleted: false,
        };
        find._id = id; 
        const category = await PostCategory
            .findOne(find)
            .populate("parent_id","title")
            .populate("createdBy.account_id", "fullname")
            .populate("updatedBy.account_id", "fullname")
            .lean();
        const parentTitle = category.parent_id ? category.parent_id.title : "Danh mục gốc";
        res.render("admin/pages/post-category/details",{
            pageTitle:category.title,
            category: category,
            parentName: parentTitle
        });
    }
    catch(error){
        req.flash("error","Có lỗi xảy ra khi tải chi tiết danh mục!")
        res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
    }
}
//GET edit/:id
module.exports.edit = async (req,res)=>{
    try{
        const permissions = res.locals.role.permissions;
        if(!permissions.includes("post_category_edit")){
            req.flash("error","Bạn không có quyền thực hiện chức năng này!")
            return res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
        }
        const id = req.params.id;
        let find={
            deleted: false,
        }
        find._id = id;
        const category = await PostCategory.findOne(find).populate("parent_id","title");
        const parentTitle = category.parent_id ? category.parent_id.title : "Danh mục gốc";
        const parentId = category.parent_id ? category.parent_id._id.toString() : "";
        const categories = await PostCategory.find({ deleted: false, status: "active" });
        const childrenIds = getChildren(categories, id); 
        const filterCategories = categories.filter(item => item._id.toString() !== id && !childrenIds.includes(item._id.toString()));
        const categoryTree = tree(filterCategories);
        res.render("admin/pages/post-category/edit",{
            pageTitle:"Chỉnh sửa danh mục bài viết",
            category: category,
            parentName: parentTitle,
            parentId: parentId,
            categoryTree: categoryTree
        })
    }
    catch(error){
        req.flash("error","Có lỗi xảy ra khi tải trang chỉnh sửa danh mục!")
        res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
    }
}
//PATCH edit/:id
module.exports.editPatch = async (req,res)=>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("post_category_edit")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
    }
    if(req.body.position){
        req.body.position = parseInt(req.body.position);
    }
    const id = req.params.id;
    const status = req.body.status;
    const categories = await PostCategory.find({deleted: false});
    let ids = changeStatusCategory(categories, status, id);
    if(!ids){
        req.flash("error", "Không thể kích hoạt danh mục khi danh mục cha chưa được kích hoạt!");
        const backUrl = req.get("Referrer");
        return res.redirect(backUrl);
    }
    let updatedBy = {
        account_id: res.locals.user._id,
        updatedAt: new Date()
    };
    try{
        await PostCategory.updateOne({_id: id}, {...req.body, $push: { updatedBy: updatedBy }});
        if(ids.length > 1){
            ids.shift();
            await PostCategory.updateMany({_id: {$in: ids}}, {status: status});
        }
        req.flash("success", "Cập nhật danh mục thành công!");
    }
    catch(error){
        req.flash("error", "Có lỗi xảy ra khi cập nhật danh mục!");
    }
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
module.exports.changeMulti = async (req, res) => {
    //console.log(req.body);  
    try {
        const typeChecked = req.body.type;
        const idsChecked = req.body.ids;
        const ids = idsChecked.split(",");
        const categories = await PostCategory.find({ deleted: false });
        let updatedBy = {
            account_id: res.locals.user._id,
            updatedAt: new Date()
        };
        const permissions = res.locals.role.permissions;
        let bulkOps = [];
        switch (typeChecked) {
            case "active":
                if(!permissions.includes("product_category_edit")) {
                    req.flash("error","Bạn không có quyền thực hiện chức năng này!")
                    return res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
                }
                const idsSelectedSet = new Set(ids);
                for (const id of ids) {
                    const current = categories.find(item => item._id.toString() === id);
                    const check = checkStatusParentsMulti(categories, current.parent_id?.toString(), idsSelectedSet);
                    if (!check) {
                        req.flash("error", `Không thể kích hoạt danh mục "${current.title}" khi danh mục cha chưa được kích hoạt!`);
                        const backUrl = req.get("Referrer");
                        return res.redirect(backUrl);
                    }
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: id },
                            update: { $set: { status: "active" }, $push: { updatedBy: updatedBy } }
                        }
                    }); 
                }
                break;

            case "inactive":
                if(!permissions.includes("post_category_edit")) {
                    req.flash("error","Bạn không có quyền thực hiện chức năng này!")
                    return res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
                }
                for (const id of ids) {
                    const allChildIds = [id, ...getChildren(categories, id)];
                    bulkOps.push({
                        updateMany: {
                            filter: { _id: { $in: allChildIds } },
                            update: { $set: { status: "inactive" }, $push: { updatedBy: updatedBy } }
                        }
                    });
                }
                break;

            case "delete-all":
                if(!permissions.includes("post_category_delete")) {
                    req.flash("error","Bạn không có quyền thực hiện chức năng này!")
                    return res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
                }
                for (const id of ids) {
                    const allChildIds = [id, ...getChildren(categories, id)];
                    bulkOps.push({
                        updateMany: {
                            filter: { _id: { $in: allChildIds } },
                            update: { 
                                $set: { 
                                    deleted: true, 
                                    deletedBy: {
                                        account_id: res.locals.user._id,
                                        deletedAt: new Date()
                                    }
                                }  
                            }
                        }
                    });
                }
                break;

            case "change-position":
                if(!permissions.includes("post_category_edit")) {   
                    req.flash("error","Bạn không có quyền thực hiện chức năng này!")
                    return res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
                }   
                for (const item of ids) {
                    const [id, position] = item.split("-");
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: id },
                            update: { $set: { position: parseInt(position) }, $push: { updatedBy: updatedBy } }
                        }
                    });
                }
                break;

            default:
                break;
        }
        if (bulkOps.length > 0) {
            await PostCategory.bulkWrite(bulkOps);
            req.flash("success", `Đã thực hiện thành công hành động cho ${bulkOps.length} nhóm bản ghi!`);
        } else {
            req.flash("error", "Không có thay đổi nào hợp lệ được thực hiện!");
        }
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${systemConfig.prefixAdmin}/post-categories`);
    }
};
//GET /recycle-bin
module.exports.recycleBin = async (req, res)=>{
    try{
        let find={};
        find.deleted = true;
        const categories = await PostCategory.find(find)
        res.render("admin/pages/post-category/recycle-bin",{
            pageTitle:"Thùng rác",
            categories: categories
        })
    }
    catch(error){
        req.flash("error","Có lỗi xảy ra khi tải thùng rác!")
        res.redirect(`${systemConfig.prefixAdmin}/post-categories`)
    }
}
//PATCH /recycle-bin/restore/:id
module.exports.restore = async (req, res)=>{
    const id = req.params.id;
    const category = await PostCategory.findOne({_id:id}).populate("parent_id","deleted status title");
    if(category.parent_id && category.parent_id.deleted && category.parent_id.status === "active"){ {
        req.flash("error", `Không thể khôi phục danh mục "${category.title}" khi danh mục cha "${category.parent_id.title}" đang bị xóa hoặc không hoạt động!`);
        const backUrl = req.get("Referrer");
        return res.redirect(backUrl);
    }
    let updatedBy = {
        account_id: res.locals.user._id,
        updatedAt: new Date()
    };
    try{
            await PostCategory.updateOne({_id:id},{deleted:false, $push: { updatedBy: updatedBy }});
            req.flash("success", "Khôi phục danh mục thành công!");
    }
        catch(error){
        req.flash("error", "Có lỗi xảy ra khi khôi phục danh mục!");
    }
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
    }
}
//DELETE /recycle-bin/hard-delete/:id
module.exports.hardDelete = async (req, res)=>{
    const id = req.params.id;
    try{
        await PostCategory.deleteOne({_id:id});
        req.flash("success", "Xóa danh mục vĩnh viễn thành công!");
    }
    catch(error){
        req.flash("error", "Có lỗi xảy ra khi xóa danh mục!");
    }   
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}