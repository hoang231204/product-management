const ProductCategory = require("../../models/product-category-model");
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
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("product_category_view")){
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
    try{
        const categories = await ProductCategory
        .find(find)
        .populate("createdBy.account_id","fullname")
        .populate("updatedBy.account_id","fullname")
        .lean();
        const categoryTree = tree(categories);
        res.render("admin/pages/product-category/index",{
            pageTitle:"Danh mục sản phẩm",
            categories: categories,
            categoryTree: categoryTree,
            filterStatus: filterStatus
        })
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
}
//GET /create
module.exports.create =async (req,res)=>{
    let find = {
        deleted: false,
        status: "active"
    }
    try{
        const categories =await ProductCategory.find();
        const categoryTree = tree(categories);
        res.render("admin/pages/product-category/create",{
            pageTitle:"Tạo danh mục sản phẩm",
            categoryTree: categoryTree
        })
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }
}
//POST /create
module.exports.createPost = async (req,res)=>{
    try{
        const permissions = res.locals.role.permissions; 
        if(!permissions.includes("product_category_create")){
            req.flash("error","Bạn không có quyền thực hiện chức năng này!")
            return res.redirect(`${systemConfig.prefixAdmin}/product-categories/create`)
        }
        const count = await ProductCategory.countDocuments({ deleted: false });
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
        const category = new ProductCategory(req.body);
        await category.save();
        req.flash('success', 'Tạo danh mục thành công!');
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        res.redirect(`${systemConfig.prefixAdmin}/product-categories/create`)
    }
}
//PATCH /change-status/:status/:id
module.exports.changeStatus = async (req,res)=>{
    try{
        const permissions = res.locals.role.permissions;
        if(!permissions.includes("product_category_edit")){
            req.flash("error","Bạn không có quyền thực hiện chức năng này!")
            return res.redirect(`${systemConfig.prefixAdmin}/product-categories`)
        }
        const id = req.params.id;
        const status = req.params.status;
        let find={
            deleted: false,
        }
        const categories = await ProductCategory.find(find);
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
        await ProductCategory.updateMany({_id: {$in: ids}}, {status: status, $push: { updatedBy: updatedBy }});
        req.flash("success", `Cập nhật trạng thái danh mục thành công!`);
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
}
//PATCH /delete/:id
module.exports.delete = async (req,res)=>{
    try{
        const permissions = res.locals.role.permissions;
        if(!permissions.includes("product_category_delete")){
            req.flash("error","Bạn không có quyền thực hiện chức năng này!")
            return res.redirect(`${systemConfig.prefixAdmin}/product-categories`)
        }
        const id = req.params.id;
        let ids=[];
        ids.push(id);
        const categories = await ProductCategory.find({deleted: false});
        const childrenId = getChildren(categories, id);
        ids.push(...childrenId);
        await ProductCategory.updateMany(
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
        req.flash("success", "Xóa danh mục thành công!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
}
//GET details/:id
module.exports.details = async (req,res)=>{
    try{
        const permissions = res.locals.role.permissions;
        if(!permissions.includes("product_category_view")){
            req.flash("error","Bạn không có quyền thực hiện chức năng này!")
            return res.redirect(`${systemConfig.prefixAdmin}/product-categories`)
        }
        const id = req.params.id;
        let find={
            deleted: false,
        };
        find._id = id; 
        const category = await ProductCategory
            .findOne(find)
            .populate("parent_id","title")
            .populate("createdBy.account_id", "fullname")
            .populate("updatedBy.account_id", "fullname")
            .lean();
        const parentTitle = category.parent_id ? category.parent_id.title : "Danh mục gốc";
        res.render("admin/pages/product-category/details",{
            pageTitle:"Chi tiết danh mục sản phẩm",
            category: category,
            parentName: parentTitle
        });
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
}
//GET edit/:id
module.exports.edit = async (req,res)=>{
    try{
        const id = req.params.id;
        let find={
            deleted: false,
        }
        find._id = id;
        const category = await ProductCategory.findOne(find).populate("parent_id","title");
        const parentTitle = category.parent_id ? category.parent_id.title : "Danh mục gốc";
        const parentId = category.parent_id ? category.parent_id._id.toString() : "";
        const categories = await ProductCategory.find({ deleted: false, status: "active" });
        const childrenIds = getChildren(categories, id); 
        const filterCategories = categories.filter(item => item._id.toString() !== id && !childrenIds.includes(item._id.toString()));
        const categoryTree = tree(filterCategories);
        res.render("admin/pages/product-category/edit",{
            pageTitle:"Chỉnh sửa danh mục sản phẩm",
            category: category,
            parentName: parentTitle,
            parentId: parentId,
            categoryTree: categoryTree
        })
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
}
//PATCH edit/:id
module.exports.editPatch = async (req,res)=>{
    try{
        const permissions = res.locals.role.permissions;
        if(!permissions.includes("product_category_edit")){
            req.flash("error","Bạn không có quyền thực hiện chức năng này!")
            return res.redirect(`${systemConfig.prefixAdmin}/product-categories`)
        }
        if(req.body.position){
            req.body.position = parseInt(req.body.position);
        }
        const id = req.params.id;
        const status = req.body.status;
        const categories = await ProductCategory.find({deleted: false});
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
        await ProductCategory.updateOne({_id: id}, {...req.body, $push: { updatedBy: updatedBy }});
        if(ids.length > 1){
            ids.shift();
            await ProductCategory.updateMany({_id: {$in: ids}}, {status: status});
        }
        req.flash("success", "Cập nhật danh mục thành công!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
}
module.exports.changeMulti = async (req, res) => {
    //console.log(req.body);  
    try {
        const typeChecked = req.body.type;
        const idsChecked = req.body.ids;
        const ids = idsChecked.split(",");
        const categories = await ProductCategory.find({ deleted: false });
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
                    return res.redirect(`${systemConfig.prefixAdmin}/product-categories`)
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
                if(!permissions.includes("product_category_edit")) {
                    req.flash("error","Bạn không có quyền thực hiện chức năng này!")
                    return res.redirect(`${systemConfig.prefixAdmin}/product-categories`)
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
                if(!permissions.includes("product_category_delete")) {
                    req.flash("error","Bạn không có quyền thực hiện chức năng này!")
                    return res.redirect(`${systemConfig.prefixAdmin}/product-categories`)
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
                if(!permissions.includes("product_category_edit")) {   
                    req.flash("error","Bạn không có quyền thực hiện chức năng này!")
                    return res.redirect(`${systemConfig.prefixAdmin}/product-categories`)
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
            await ProductCategory.bulkWrite(bulkOps);
            req.flash("success", `Đã thực hiện thành công hành động cho ${bulkOps.length} nhóm bản ghi!`);
        } else {
            req.flash("error", "Không có thay đổi nào hợp lệ được thực hiện!");
        }
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");
        res.redirect(`${systemConfig.prefixAdmin}/product-categories`);
    }
};
//GET /recycle-bin
module.exports.recycleBin = async (req, res)=>{
    try{
        let find={};
        find.deleted = true;
        const categories = await ProductCategory.find(find)
        res.render("admin/pages/product-category/recycle-bin",{
            pageTitle:"Thùng rác",
            categories: categories
        })
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
}
//PATCH /recycle-bin/restore/:id
module.exports.restore = async (req, res)=>{
   try{
    const id = req.params.id;
    const category = await ProductCategory.findOne({_id:id}).populate("parent_id","deleted status title");
    if(category.parent_id && category.parent_id.deleted && category.parent_id.status === "active"){ {
        req.flash("error", `Không thể khôi phục danh mục "${category.title}" khi danh mục cha "${category.parent_id.title}" đang bị xóa hoặc không hoạt động!`);
        const backUrl = req.get("Referrer");
        return res.redirect(backUrl);
    }
    await ProductCategory.updateOne({_id:id},{deleted:false, deletedBy: null});
    req.flash("success", "Khôi phục danh mục thành công!");
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
    }
   }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
}   
//DELETE /recycle-bin/hard-delete/:id
module.exports.hardDelete = async (req, res)=>{
    try{
        const id = req.params.id;
        await ProductCategory.deleteOne({_id:id});
        req.flash("success", "Xóa danh mục vĩnh viễn thành công!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
    catch(error){
        req.flash("error","Đã có lỗi xảy ra, vui lòng thử lại!")
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
}