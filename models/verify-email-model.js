const mongoose = require("mongoose");
const generateOTP = require('../helpers/generate-otp');
const verifyEmailSchema = new mongoose.Schema(
  {
    newEmail: String, 
    otp:{
        type: String,
        default: generateOTP
    },      
    expireAt: {
      type: Date,
      default: Date.now,
      expires: 180 
    }
  },
  { timestamps: true }
);

verifyEmailSchema.index({ newEmail: 1, otp: 1 });

const VerifyEmail = mongoose.model("VerifyEmail", verifyEmailSchema, "verify-email");
module.exports = VerifyEmail;