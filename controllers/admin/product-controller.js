const Product = require('../../models/product-model')
const Category = require('../../models/category-model')
const filter = require("../../helpers/filter-status")
const search = require("../../helpers/search")  
const pagination = require("../../helpers/pagination") 
const systemConfig = require("../../config/system")
const tree = require("../../helpers/create-tree")

//DANH SÁCH SẢN PHẨM
module.exports.index = async (req, res) => {
    const filterStatus = filter(req.query);
    const regex = search(req.query);
    let find = {
    };
    find.delete = false;
    if (req.query.status) {
        find.status = req.query.status;
    }
    if (req.query.keyword) {
        find.title = regex;
    }
    
    const countData = await Product.find(find).countDocuments(find);
    //console.log(countData)
    const objectPagination = pagination(req.query,countData)
    //console.log(objectPagination.currentPage)
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
        .skip(objectPagination.skipPage);
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
    const statusChange = req.params.status
    const id = req.params.id
    try {
        await Product.updateOne({_id:id},{status:statusChange})
        const backUrl = req.get("Referrer");
        req.flash('success', 'Cập nhật trạng thái thành công!')
        res.redirect(backUrl);
    } catch (error) {
        res.status(500).send("Lỗi server");
    }
}
//CẬP NHẬT NHIỀU TRẠNG THÁI
module.exports.changeMulti = async (req, res) => {
    //console.log(req.body)
    const idsChecked = req.body.ids; 
    const typeChecked = req.body.type;
    const ids = idsChecked.split(","); 

    switch (typeChecked) {
        case "delete":
            await Product.updateMany({ _id: { $in: ids } }, { 
                deleted: true,
                deletedAt: new Date() 
            });
            break;

        case "change-position":
            for (const item of ids) {
                const [id, position] = item.split("-");
                const newPosition = parseInt(position);
                await Product.updateOne({ _id: id }, { position: newPosition });
            }
            break;

        default:
            await Product.updateMany({ _id: { $in: ids } }, { status: typeChecked });
    }
    req.flash('success', 'Cập nhật trạng thái thành công!');
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//XÓA VÀO THÙNG RÁC
module.exports.delete = async (req,res)=>{
    const idDel = req.params.id;
    await Product.updateOne({_id:idDel},{$set: { delete: true, deleteAt: new Date() }})
    req.flash('success', 'Xóa sản phẩm thành công!');
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//THÙNG RÁC
module.exports.recycleBin = async (req, res)=>{
    let find={};
    find.delete = true;
    const products = await Product.find(find);
    res.render("admin/pages/products/recycleBin",{
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
    await Product.updateOne({_id:dataId},{delete:false, deleteAt:null})
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
    
    req.body.price = parseInt(req.body.price)
    req.body.discountPercentage = parseInt(req.body.discountPercentage)
    req.body.stock = parseInt(req.body.stock)
    const count = await Product.countDocuments()
    if(req.body.position == ''){
        req.body.position = count + 1;
    }
    // if(req.file){
    //      req.body.thumbnail = `/uploads/${req.file.filename}`
    // }
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
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    // if(req.file){
    //     req.body.thumbnail = `/uploads/${req.file.filename}`
    // }
    const id = req.params.id;
    try {
        await Product.updateOne({_id:id},req.body);
        req.flash("success","Cập nhật sản phẩm thành công!");
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    } catch (error) {
        req.flash("error","Cập nhật sản phẩm thất bại!");
        const backUrl = req.get("Referrer");
        res.redirect(backUrl);
    }
    
}
//DETAILS
module.exports.details = async (req,res)=>{
    const find = {
        _id: req.params.id,
        delete: false
    }
    const product = await Product.findOne(find).populate("category");
    const categoryTitle = product.category ? product.category.title : "N/A";
    if (!product) {
        res.status(404).send("Sản phẩm không tồn tại");
    } else {
        res.render("admin/pages/products/details", {
            pageTitle: product.title,
            product: product,
            categoryTitle: categoryTitle
        });
    }
}
