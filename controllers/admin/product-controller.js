const Product = require('../../models/product-model')
const Category = require('../../models/category-model')
const Account = require('../../models/account-model')
const filter = require("../../helpers/filter-status")
const search = require("../../helpers/search")  
const pagination = require("../../helpers/pagination") 
const systemConfig = require("../../config/system")
const tree = require("../../helpers/create-tree")

//DANH SÁCH SẢN PHẨM
module.exports.index = async (req, res) => {
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("product_view")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/products`)
    }
    const filterStatus = filter(req.query);
    const regex = search(req.query);
    let find = {};
    find.deleted = false;
    if (req.query.status) {
        find.status = req.query.status;
    }
    if (req.query.keyword) {
        find.title = regex;
    }
    const countData = await Product.find(find).countDocuments(find);
    const objectPagination = pagination(req.query,countData)
    let sort={};
    if(req.query.sortBy && req.query.sortType){
        sort[req.query.sortBy] = req.query.sortType;
    }
    else{
        sort.position = -1;
    }
    try {
        const products = await Product
            .find(find)
            .sort(sort)
            .limit(objectPagination.limitPage)
            .skip(objectPagination.skipPage)
            .populate("createdBy.account_id","fullname")
            .populate("updatedBy.account_id","fullname")
            .lean()
        res.render('admin/pages/products/index', {
            pageTitle: "Danh sách sản phẩm",
            products: products,
            filterStatus: filterStatus,
            keyword: req.query.keyword,
            objectPagination: objectPagination
    });
    } catch (error) {
        res.status(500).send("Lỗi server");
    } 
}
//CẬP NHẬT TRẠNG THÁI
module.exports.changeStatus =async (req,res)=>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("product_edit")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/products`)
    }      
    const statusChange = req.params.status
    const id = req.params.id
    let updatedBy = {
        account_id: res.locals.user._id,
        updatedAt: new Date()
    };
    try {
        await Product.updateOne({_id:id},{status:statusChange, $push: { updatedBy: updatedBy }})
        const backUrl = req.get("Referrer");
        req.flash('success', 'Cập nhật trạng thái thành công!')
        res.redirect(backUrl);
    } catch (error) {
        res.status(500).send("Lỗi server");
    }
}
//CẬP NHẬT NHIỀU TRẠNG THÁI
module.exports.changeMulti = async (req, res) => {
    const idsChecked = req.body.ids; 
    const typeChecked = req.body.type;
    const ids = idsChecked.split(","); 
    let updatedBy = {
        account_id: res.locals.user._id,
        updatedAt: new Date()
    };
    const permissions = res.locals.role.permissions;
    switch (typeChecked) {
        case "delete":
            if(!permissions.includes("product_delete")){
                req.flash("error","Bạn không có quyền thực hiện chức năng này!")
                return res.redirect(`${systemConfig.prefixAdmin}/products`)
            }
            await Product.updateMany(
            { 
                _id: { $in: ids },
                deleted: false 
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
            break;

        case "change-position":
            if(!permissions.includes("product_edit")) {
                req.flash("error","Bạn không có quyền thực hiện chức năng này!")
                return res.redirect(`${systemConfig.prefixAdmin}/products`)
            }
            for (const item of ids) {
            const [id, position] = item.split("-");
            const newPosition = parseInt(position);
            await Product.updateOne({ _id: id }, { position: newPosition, $push: { updatedBy: updatedBy } });
            }
            break;
        default:
            if(!permissions.includes("product_edit")) {
                req.flash("error","Bạn không có quyền thực hiện chức năng này!")
                return res.redirect(`${systemConfig.prefixAdmin}/products`)
            }
            await Product.updateMany({ _id: { $in: ids } }, { status: typeChecked, $push: { updatedBy: updatedBy } }); 
    }
    req.flash('success', 'Cập nhật trạng thái thành công!');
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//XÓA MỀM
module.exports.delete = async (req, res) => {
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("product_delete")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/products`)
    }
    try {
        const idDel = req.params.id;
        const accountId = res.locals.user._id;
        await Product.updateOne(
            { 
                _id: idDel, 
                deleted: false 
            },
            {
                $set: {
                    deleted: true,
                    deletedBy: {
                        account_id: accountId,
                        deletedAt: new Date()
                    }
                }
            }
        );
        req.flash('success', 'Xóa sản phẩm thành công!');
    } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        req.flash('error', 'Đã có lỗi xảy ra, không thể xóa sản phẩm.');
    }
    const backUrl = req.get("Referrer") || `${systemConfig.prefixAdmin}/products`;
    res.redirect(backUrl);
};
//THÙNG RÁC
module.exports.recycleBin = async (req, res)=>{
    let find={};
    find.deleted = true;
    const products = await Product.find(find).populate("deletedBy.account_id","fullname").lean();
    res.render("admin/pages/products/recycle-bin",{
        pageTitle:"Thùng rác",
        products: products
    })
}
//XÓA VĨNH VIỄN
module.exports.hardDelete = async (req,res)=>{
    const dataId = req.params.id;
    await Product.deleteOne({_id:dataId})
    req.flash('success', 'Xóa sản phẩm vĩnh viễn thành công!');
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//KHÔI PHỤC
module.exports.restore = async (req,res)=>{
    const dataId = req.params.id;
    await Product.updateOne({_id:dataId},{deleted:false, deletedBy: null})
    req.flash('success', 'Khôi phục sản phẩm thành công!');
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//GET CREATE
module.exports.create = async (req, res)=>{
    const categories = await Category.find({status: "active", deleted: false});
    const categoryTree = tree(categories);
    res.render("admin/pages/products/create", {
        pageTitle: "Tạo mới sản phẩm",
        categoryTree: categoryTree
    });
}
//POST CREATE
module.exports.createPost = async (req, res)=>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("product_create")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/products`)
    }
    req.body.price = parseInt(req.body.price)
    req.body.discountPercentage = parseInt(req.body.discountPercentage)
    req.body.stock = parseInt(req.body.stock)
    const count = await Product.countDocuments()
    if(req.body.position == ''){
        req.body.position = count + 1;
    }
    req.body.createdBy = {
        account_id: res.locals.user._id
    }
    const product = new Product(req.body)
    product.save();
    req.flash('success', 'Tạo sản phẩm thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/products`)
        
 }
//GET EDIT
module.exports.edit= async (req,res)=>{
    try {
        const categories = await Category.find({deleted: false},{status: "active"});
        const categoryTree = tree(categories);
        const product = await Product.findById(req.params.id).populate("category");
        const categoryId = product.category ? product.category._id : null;
        const categoryTitle = product.category ? product.category.title : "N/A";
        const updatedBy= {

        }
        res.render("admin/pages/products/edit",{
            pageTitle: "Sửa sản phẩm",
            product: product,
            categoryTree: categoryTree,
            categoryId: categoryId,
            categoryTitle: categoryTitle
        })
    } catch (error) {
        res.status(404).send("Sản phẩm không tồn tại");
    }
}
//POST EDIT
module.exports.editPatch = async (req,res)=>{
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("product_edit"))
    {
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/products`)
    }
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    const id = req.params.id;
    let updatedBy = {
        account_id: res.locals.user._id,
        updatedAt: new Date()
    };
    try {
        await Product.updateOne({_id:id},{...req.body, $push: { updatedBy: updatedBy }});
        req.flash("success","Cập nhật sản phẩm thành công!");
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    } catch (error) {
        req.flash("error","Cập nhật sản phẩm thất bại!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
    
}
//DETAILS
module.exports.details = async (req, res) => {
    const permissions = res.locals.role.permissions;
    if(!permissions.includes("product_view")){
        req.flash("error","Bạn không có quyền thực hiện chức năng này!")
        return res.redirect(`${systemConfig.prefixAdmin}/products`)
    }
    const product = await Product
        .findOne({ _id: req.params.id }) 
        .populate("category", "title")
        .populate("createdBy.account_id", "fullname")
        .populate("updatedBy.account_id", "fullname")
        .lean();
    if (!product) {
        return res.status(404).send("Sản phẩm không tồn tại");
    }
    const categoryTitle = product.category?.title || "N/A";
    res.render("admin/pages/products/details", {
        pageTitle: product.title,
        product: product,
        categoryTitle: categoryTitle
    });
}
