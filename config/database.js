const mongoose = require('mongoose');

module.exports.connect = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("Conneted!")
    } catch (error) {
        console.log(error);
    }
}