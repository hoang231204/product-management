const Category = require("../../models/category-model");
const systemConfig = require("../../config/system")
const tree = require("../../helpers/create-tree");
const filter = require("../../helpers/filter-status")
const keyword = require("../../helpers/search");
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
    const category = new Category(req.body);
    await category.save();
    req.flash('success', 'Tạo danh mục thành công!');
    res.redirect(`${systemConfig.prefixAdmin}/categories`);
}
//PATCH /change-status/:status/:id
module.exports.changeStatus = async (req,res)=>{
    const id = req.params.id;
    const status = req.params.status;
    let find = {
        deleted: false
    };
    find.parent_id = id;
    const categoryChild = await Category.find(find);
    const ids=[];
    ids.push(id);
    if( categoryChild.length > 0){
        categoryChild.forEach(item=>{
            ids.push(item._id);
        })
    }
    await Category.updateMany({_id: {$in: ids}}, {status: status});
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//PATCH /delete/:id
module.exports.delete = async (req,res)=>{
    const id = req.params.id;
    await Category.updateOne({_id: id}, {deleted: true});
    const backUrl = req.get("Referrer");
    res.redirect(backUrl);
}
//GET details/:id
module.exports.details = async (req,res)=>{
    const id = req.params.id;
    console.log(id);
    let find={
        deleted: false,
    };
    find._id = id;
    const category = await Category.findOne(find);
    res.render("admin/pages/category/details",{
        pageTitle:"Chi tiết danh mục sản phẩm",
        category: category
    });
}
//GET edit/:id
module.exports.edit = async (req,res)=>{
    const id = req.params.id;
    console.log(id)
    let find={
        deleted: false,
    }
    find._id = id;
    const category = await Category.findOne(find);
    const categories =await Category.find();
    const categoryTree = tree(categories);
    res.render("admin/pages/category/edit",{
        pageTitle:"Chỉnh sửa danh mục sản phẩm",
        category: category,
        categoryTree: categoryTree
    })
}
//PATCH edit/:id
module.exports.editPatch = async (req,res)=>{
}