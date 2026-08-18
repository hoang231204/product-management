const mongoose = require("mongoose")
const generateToken = require("../helpers/generate-token")
const schema = new mongoose.Schema({ 
    fullname: String,
    email: String,
    hashedPassword: String,
    avatar: String,
    phone: String,
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    deleted:{
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedBy:[
        {
            account_id:{
            type: String,
            ref: "Account"
            },
        updatedAt: {
            type: Date,
            default: Date.now
            }
     }
    ],
    deletedBy:{
        account_id:{
            type: String,
            ref: "Account"
        },
        deletedAt: {
            type: Date,
            default: Date.now
        }
    }
})
const User = mongoose.model('User', schema, "users");
module.exports = User;