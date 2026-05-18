const moonoose = require('mongoose');
const schema = new moonoose.Schema({
    user_id: String,
    products:[{
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
    }
)
const Cart = moonoose.model('Cart', schema, "carts");
module.exports = Cart;