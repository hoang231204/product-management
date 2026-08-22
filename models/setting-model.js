const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    websiteName: String,
    logo: String,
    banner: String,  
    phone: String,
    email: String,
    address: String,
    mapLocation: String, 
    copyright: String,
    social: {
      facebook: String,
      youtube: String,
      tiktok: String   
    }
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model("Setting", settingSchema, "settings");

module.exports = Setting;