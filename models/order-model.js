const mongoose = require('mongoose');
const generateCode = require('../helpers/generate-code');
const orderSchema = new mongoose.Schema({
    cart_id: String,
    user_id: String,
    order_code: {
        type: String,
        unique: true,
        default: () => generateCode()
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
        enum: ['unpaid', 'paid', 'expired','cancelledPayment', 'cancelledOrder'],
        default: 'unpaid'
    },
    vnpayTransactionNo: {
        type: String, 
        default: ''
    },

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
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
    expiresAt: {
        type: Date,
        default: function() {
            const now = new Date();
            return new Date(now.getTime() + 5 * 60 * 1000);
        }
    },
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

orderSchema.index({ user_id: 1, deleted: 1, createdAt: -1 });
orderSchema.index({ status: 1, deleted: 1 });
orderSchema.index({ paymentStatus: 1, paymentMethod: 1, expiresAt: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;