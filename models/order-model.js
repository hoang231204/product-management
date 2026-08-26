const mongoose = require('mongoose');
const generateCode = require('../helpers/generate-code');
const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
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
        phone: String,
        address: String
    },
    products:[
        {
            product_id:{
                type: String,
                ref: 'Product'
            },
            price: Number,
            discountPercentage: Number,
            quantity: Number
        }
    ],
    totalPrice: Number,
    
    paymentMethod: {
        type: String,
        enum: ['COD', 'VNPAY'], 
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'expired','cancelled'],
        default: 'unpaid'
    },
    vnpayTransactionNo: {
        type: String, 
        default: ''
    },

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'canceled'],
        default: 'pending'
    },
    deleted:{
        type: Boolean,
        default: false
    },
    deletedBy:{
        account_id: {
            type: String,
            ref: "Account"
        },
        deletedAt:{
            type: Date,
            default: Date.now
        }
    },
    expiresAt: expiresAt,
    createdAt:{
        type: Date,
        default: Date.now
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

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;