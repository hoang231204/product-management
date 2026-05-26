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
    createdBy:{
        account_id:{
            type: String,
            ref: "Account",
        },
        createdAt:{
            type: Date,
            default: Date.now
        }
    },
    deletedBy:{
        account_id:{
            type: String,
            ref: "Account",
        },
        deletedAt:{
            type: Date,
            default: Date.now
        }
    },
    updatedBy:[
        {
            account_id: {
                type: String,
                ref: "Account"
            },
            updatedAt:{
                type: Date,
                default: Date.now
            }
        }
    ]
});

const ProductCategory = mongoose.model('ProductCategory', categorySchema, "product_categories");
module.exports = ProductCategory;