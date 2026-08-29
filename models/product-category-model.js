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
        ref: "ProductCategory" 
    },
    description: String,
    thumbnail: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
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

categorySchema.index({ parent_id: 1, deleted: 1 });
categorySchema.index({ deleted: 1, status: 1, position: -1 });

const ProductCategory = mongoose.model('ProductCategory', categorySchema, "product_categories");
module.exports = ProductCategory;