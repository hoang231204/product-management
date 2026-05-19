const mongoose = require("mongoose")
const generateToken = require("../helpers/generate-token")
const schema = new mongoose.Schema({ 
    fullname: String,
    email: String,
    password: String,
    token: {
        type: String,
        default: generateToken
    },
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
    deletedAt:{
        type: Date
    }
    },
    {
        timestamps: true
    }
)
const User = mongoose.model('User', schema, "users");
module.exports = User;