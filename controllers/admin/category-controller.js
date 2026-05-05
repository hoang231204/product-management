const Category = require("../../models/category-model");
const systemConfig = require("../../config/system")
const tree = require("../../helpers/create-tree");
const filter = require("../../helpers/filter-status")
const keyword = require("../../helpers/search");
const getChildren = require("../../helpers/get-children")
const checkStatusParents = require("../../helpers/check-status-parents");
const changeStatus = require("../../helpers/change-status");
//GET /categories
module.exports.index =async (req,res)=>{
    const filterStatus = filter(req.query).slice(0,3);
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
    const categories = await Category.find(find);
    const categoryTree = tree(categories);
    res.render("admin/pages/category/index",{
        pageTitle:"Danh mục sản phẩm",
        categories: categories,
        categoryTree: categoryTree,
        filterStatus: filterStatus
    })
}
//GET /create
module.exports.create =async (req,res)=>{
    let find = {
        deleted: false,
        status: "active"
    }
    const categories =await Category.find();
    const categoryTree = tree(categories);
    res.render("admin/pages/category/create",{
        pageTitle:"Tạo danh mục sản phẩm",
        categoryTree: categoryTree
    })
}
//POST /create
module.exports.createPost = async (req,res)=>{
    const count = await Category.countDocuments();
    if(req.body.position ==''){
        req.body.position = count + 1;
    }
    if(req.body.parent_id == ""){
        req.body.parent_id = null;
    }
    const category = new Category(req.body);
    await category.save();
    req.flash('success', 'Tạo danh mục thành công!');
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//PATCH /change-status/:status/:id
module.exports.changeStatus = async (req,res)=>{
    const id = req.params.id;
    const status = req.params.status;
    let find={
        deleted: false,
    }
    const categories = await Category.find(find);
    let ids = changeStatus(categories, status, id, req, res);
    if(!ids){
        req.flash("error", "Không thể kích hoạt danh mục khi danh mục cha chưa được kích hoạt!");
        const backUrl = req.get("Referrer");
        return res.redirect(backUrl);
    }
    await Category.updateMany({_id: {$in: ids}}, {status: status});
    req.flash("success", "Cập nhật trạng thái danh mục thành công!");
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//PATCH /delete/:id
module.exports.delete = async (req,res)=>{
    const id = req.params.id;
    let ids=[];
    ids.push(id);
    const categories = await Category.find({deleted: false});
    const childrenId = getChildren(categories, id);
    ids.push(...childrenId);
    await Category.updateMany({_id: {$in: ids}}, {deleted: true}, {deleteAt: new Date()});
    req.flash("success", "Xóa danh mục thành công!");
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//GET details/:id
module.exports.details = async (req,res)=>{
    const id = req.params.id;
    let find={
        deleted: false,
    };
    find._id = id; 
    const category = await Category.findOne(find).populate("parent_id","title");
    const parentTitle = category.parent_id ? category.parent_id.title : "Danh mục gốc";
    res.render("admin/pages/category/details",{
        pageTitle:"Chi tiết danh mục sản phẩm",
        category: category,
        parentName: parentTitle
    });
}
//GET edit/:id
module.exports.edit = async (req,res)=>{
    const id = req.params.id;
    let find={
        deleted: false,
    }
    find._id = id;
    const category = await Category.findOne(find).populate("parent_id","title");
    const parentTitle = category.parent_id ? category.parent_id.title : "Danh mục gốc";
    const parentId = category.parent_id ? category.parent_id._id.toString() : "";
    const categories = await Category.find({ deleted: false, status: "active" });
    const childrenIds = getChildren(categories, id); 
    const filterCategories = categories.filter(item => item._id.toString() !== id && !childrenIds.includes(item._id.toString()));
    const categoryTree = tree(filterCategories);
    res.render("admin/pages/category/edit",{
        pageTitle:"Chỉnh sửa danh mục sản phẩm",
        category: category,
        parentName: parentTitle,
        parentId: parentId,
        categoryTree: categoryTree
    })
}
//PATCH edit/:id
module.exports.editPatch = async (req,res)=>{
    if(req.body.position){
        req.body.position = parseInt(req.body.position);
    }
    const id = req.params.id;
    const status = req.body.status;
    const categories = await Category.find({deleted: false});
    let ids = changeStatus(categories, status, id);
    if(!ids){
        req.flash("error", "Không thể kích hoạt danh mục khi danh mục cha chưa được kích hoạt!");
        const backUrl = req.get("Referrer");
        return res.redirect(backUrl);
    }
    await Category.updateOne({_id: id}, req.body);
    if(ids.length > 1){
        ids.shift();
        await Category.updateMany({_id: {$in: ids}}, {status: status});
    }
    req.flash("success", "Cập nhật danh mục thành công!");
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
module.exports.changeMulti = async (req, res) => {
    //console.log(req.body);  
    try {
        const typeChecked = req.body.type;
        const idsChecked = req.body.ids;
        const ids = idsChecked.split(",");
        const categories = await Category.find({ deleted: false });
        let bulkOps = [];
        switch (typeChecked) {
            case "active":
                for (const id of ids) {
                    const current = categories.find(item => item.id === id);
                    if (checkStatusParents(categories, current.parent_id)) {
                        bulkOps.push({
                            updateOne: {
                                filter: { _id: id },
                                update: { $set: { status: "active" } }
                            }
                        });
                    }
                }
                break;

            case "inactive":
                for (const id of ids) {
                    const allChildIds = [id, ...getChildren(categories, id)];
                    bulkOps.push({
                        updateMany: {
                            filter: { _id: { $in: allChildIds } },
                            update: { $set: { status: "inactive" } }
                        }
                    });
                }
                break;

            case "delete-all":
                for (const id of ids) {
                    const allChildIds = [id, ...getChildren(categories, id)];
                    bulkOps.push({
                        updateMany: {
                            filter: { _id: { $in: allChildIds } },
                            update: { 
                                $set: { 
                                    deleted: true, 
                                    deletedAt: new Date() 
                                } 
                            }
                        }
                    });
                }
                break;

            case "change-position":
                for (const item of ids) {
                    const [id, position] = item.split("-");
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: id },
                            update: { $set: { position: parseInt(position) } }
                        }
                    });
                }
                break;

            default:
                break;
        }
        if (bulkOps.length > 0) {
            await Category.bulkWrite(bulkOps);
            req.flash("success", `Đã thực hiện thành công hành động cho ${bulkOps.length} nhóm bản ghi!`);
        } else {
            req.flash("error", "Không có thay đổi nào hợp lệ được thực hiện!");
        }
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    } catch (error) {
        req.flash("error", "Có lỗi xảy ra!");;
    }
};
//GET /recycle-bin
module.exports.recycleBin = async (req, res)=>{
    let find={};
    find.deleted = true;
    const categories = await Category.find(find)
    res.render("admin/pages/category/recycleBin",{
        pageTitle:"Thùng rác",
        categories: categories
    })
}
//PATCH /recycleBin/restore/:id
module.exports.restore = async (req, res)=>{
   
    
}
//PATCH /recycleBin/hard-delete/:id
module.exports.forceDelete = async (req, res)=>{
}