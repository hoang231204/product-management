const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    user_id: String,
    products: [{
        product_id: {
            type: String,
            default: null,
            ref: "Product"
        },
        quantity: Number
    }]
},
    {
        timestamps: true
    });

schema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });
schema.index({ user_id: 1 });

const Cart = mongoose.model('Cart', schema, "carts");
module.exports = Cart;