const mongoose = require("mongoose");

const schema = new mongoose.Schema({ 
    fullname:{
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    avatar: String,
    phone: String,
    tokenReset: {
        type: String
    },
    tokenResetExpires: {
        type: Date
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    deleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: [
        {
            account_id: {
                type: String,
                ref: "Account"
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    deletedBy: {
        account_id: {
            type: String,
            ref: "Account"
        },
        deletedAt: {
            type: Date,
            default: Date.now
        }
    }
});

const User = mongoose.model('User', schema, "users");
module.exports = User;