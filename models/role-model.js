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
    deleteAt:Date
},{
    timestamps: true
});
const Role = mongoose.model('Role', schema, "roles");
module.exports = Role;