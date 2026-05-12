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
}
)
const Account = mongoose.model('Account', schema, "accounts");
module.exports = Account;