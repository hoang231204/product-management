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
    telephone: String,
    role_id:{
        type: String,
        ref: "Role",
        default:null
    },
    status: String,
    deleted:{
        type: Boolean,
        default: false
    },
    deleteAt:Date
},{
    timestamps: true
});
const Account = mongoose.model('Account', schema, "accounts");
module.exports = Account;