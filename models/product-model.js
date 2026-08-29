const mongoose = require("mongoose")
const slug = require('mongoose-slug-updater')
mongoose.plugin(slug)
const schema = new mongoose.Schema({ 
    title: String,
    category_id:{
        type: String,
        ref: "ProductCategory",
        default: null
    },
    description: String,
    price: Number,
    discountPercentage: Number,
    stock:Number,
    thumbnail: String,
    status: {
        type: String,
        enum: ['active', 'inactive','pending','low-stock'],
        default: 'active'
    },
    position: Number,
    featured:String,
    slug: { type: String, slug: "title", unique:true },
    deleted:{
        type: Boolean,
        default: false
    },
    createdBy:{
        account_id: {
            type: String,
            ref: "Account"
        },
        createdAt:{
            type: Date,
            default: Date.now
        },
    },
    deletedBy:{
        account_id: {
            type: String,
            ref: "Account"
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

schema.index({ deleted: 1, status: 1, position: -1 });
schema.index({ category_id: 1, deleted: 1, status: 1 });
schema.index({ featured: 1, deleted: 1, status: 1 });
schema.index({ title: "text" });

const Product = mongoose.model('Product', schema, "products");
module.exports = Product;