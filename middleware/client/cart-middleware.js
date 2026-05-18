const Cart = require('../../models/cart-model');
module.exports.cart = async (req, res, next) =>{
    if(!req.cookies.cartId){
        const cart = new Cart();
        await cart.save();
        res.cookie('cartId', cart._id.toString(), {maxAge: 1000 * 60 * 60 * 24 * 7});
        req.cartId = cart._id.toString();
    }
    else{
        req.cartId = req.cookies.cartId;
    }
    next();
}