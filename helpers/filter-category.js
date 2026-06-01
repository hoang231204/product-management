const PostCategory = require('../models/post-category-model');
module.exports = async (query) => {
    let allCategories = await PostCategory.find().select('title slug').lean();
    allCategories.unshift({ title: "Tất cả", slug: "" });
    allCategories = allCategories.map(item => {
        return {
            ...item,
            class: ""
        }
    })
    if(query.slugCategory){
        const index = allCategories.findIndex(item => item.slug == query.slugCategory)
        allCategories[index].class = "active"
    }else{
        const index = allCategories.findIndex(item => item.slug === "")
        allCategories[index].class = "active"
    }
    return allCategories;
}