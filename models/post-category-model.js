const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);
const schema = new mongoose.Schema({
    title: String,
    parent_id: {
        type: String,
        ref: "PostCategory",
        default: null
    },
    description: String,
    thumbnail: String,
    status: {
        type: String,
        enum: ['active', 'inactive','pending'],
        default: 'active'
    },
    position: Number,
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
const PostCategory = mongoose.model('PostCategory', schema, 'post_categories');
module.exports = PostCategory;