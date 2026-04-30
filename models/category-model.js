const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const categorySchema = new mongoose.Schema({ 
    title: {
        type: String,
        required: true 
    },
    parent_id: {
        type: String,
        default: null,
        ref: "Category" 
    },
    description: String,
    thumbnail: String,
    status: {
        type: String,
        default: "active"
    },
    position: Number,
    slug: { 
        type: String, 
        slug: "title", 
        unique: true 
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deleteAt: Date
}, {
    timestamps: true 
});

const Category = mongoose.model('Category', categorySchema, "categories");
module.exports = Category;