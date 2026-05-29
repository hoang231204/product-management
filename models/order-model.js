const mongoose = require('mongoose');
const generateCode = require('../helpers/generate-code');
const orderSchema = new mongoose.Schema({
    cart_id: String,
    user_id: String,
    order_code: {
        type: String,
        unique: true,
        default: generateCode()
    },
    userInfor:{
        fullname: String,
        phone:String,
        address: String
    },
    products:[
        {
            product_id:{
                type:String,
                ref: 'Product'
            },
            price: Number,
            discountPercentage: Number,
            quantity: Number
        }
    ],
    totalPrice: Number,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'canceled'],
        default: 'pending'
    },
    deleted:{
        type: Boolean,
        default: false
    },
    deletedAt:{
        type: Date
    }
}
, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;