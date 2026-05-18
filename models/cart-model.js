const moonoose = require('mongoose');
const schema = new moonoose.Schema({
    user_id: String,
    products:[]
    },
    {
        timestamps: true
    }
)
const Cart = moonoose.model('Cart', schema, "carts");
module.exports = Cart;