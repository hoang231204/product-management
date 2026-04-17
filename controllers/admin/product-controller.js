const Product = require('../../models/product-model')
const filter = require("../../helpers/fillterStatus")
const search = require("../../helpers/search")  
const pagination = require("../../helpers/pagination") 
const systemConfig = require("../../config/system")

//DANH SÁCH SẢN PHẨM
module.exports.index = async (req, res) => {
    // BỘ LỌC
    const filterStatus = filter(req.query);
    // TÌM KIẾM
    const regex = search(req.query);
    //QUERY DATABASE
    let find = {
    };
    find.delete = false;
    if (req.query.status) {
        find.status = req.query.status;
    }
    if (req.query.keyword) {
        find.title = regex;
    }
    
    //PHÂN TRANG
    const countData = await Product.countDocuments(find);
    //console.log(countData)
    const objectPagination = pagination(req.query,countData)
    //console.log(objectPagination.currentPage)

    const products = await Product
        .find(find)
        .sort({position: -1})
        .limit(objectPagination.limitPage)
        .skip(objectPagination.skipPage);

    res.render('admin/pages/products/index', {
        pageTitle: "Danh sách sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: req.query.keyword,
        objectPagination: objectPagination
    });
}
module.exports.changeStatus =async (req,res)=>{
    const statusChange = req.params.status
    const id = req.params.id
    await Product.updateOne({_id:id},{status:statusChange})
    const backUrl = req.get("Referrer");
    req.flash('success', 'Cập nhật trạng thái thành công!')
    res.redirect(backUrl);
  

}
//THAY ĐỔI NHIỀU TRẠNG THÁI
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
    
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//XÓA VÀO THÙNG RÁC
module.exports.delete = async (req,res)=>{
    const idDel = req.params.id;
    await Product.updateOne({_id:idDel},{$set: { delete: true, deleteAt: new Date() }})
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
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//KHÔI PHỤC
module.exports.restore = async (req,res)=>{
    const dataId = req.params.id;
    await Product.updateOne({_id:dataId},{delete:false, deleteAt:null})
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//GET CREATE
module.exports.create = async (req, res)=>{
    res.render("admin/pages/products/create")
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
    res.redirect(`${systemConfig.prefixAdmin}/products`)
}
//GET EDIT
module.exports.edit= async (req,res)=>{
    try {
         //console.log(req.params.id)
    const product = await Product.findById(req.params.id);
    res.render("admin/pages/products/edit",{
        pageTitle: "Sửa sản phẩm",
        product: product
    })
    } catch (error) {
        res.status(404).send("Sản phẩm không tồn tại");
    }
}
//POST EDIT
module.exports.editPost = async (req,res)=>{
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    if(req.file){
        req.body.thumbnail = `/uploads/${req.file.filename}`
    }
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
    const product = await Product.findOne(find);
    if (!product) {
        res.status(404).send("Sản phẩm không tồn tại");
    } else {
        res.render("admin/pages/products/details", {
            pageTitle: product.title,
            product: product
        });
    }
}
