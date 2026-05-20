const generateOTP = require('../helpers/generate-otp');
const generateToken = require('../helpers/generate-token');
const mongoose = require("mongoose");
const schema = new mongoose.Schema({
    email: String,
    otp:{
        type: String,
        default: generateOTP
    },
    expireAt: {
        type: Date,
        expires: 180
    }
    },
    {
        timestamps: true
    }
)
const ForgotPassword = mongoose.model('ForgotPassword', schema, "forgot_passwords");
module.exports = ForgotPassword;