const mongoose = require("mongoose")
const schema = new mongoose.Schema({ 
    title: String,
    description: String,
    permissions:{
        type: Array,
        default: []
    },
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
});
const Role = mongoose.model('Role', schema, "roles");
module.exports = Role;