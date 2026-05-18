const Cart = require('../../models/cart-model');
module.exports.add= async (req,res)=>{
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity) || 1;
    const cartId = req.cartId;
    let product = {
        productId: productId,
        quantity: quantity
    }
    const cart = await Cart.findById(cartId);
    const existingProductIndex = cart.products.findIndex(item => item.productId.toString() === productId);
    if(existingProductIndex !== -1){
        cart.products[existingProductIndex].quantity += quantity;
    }
    else{
        cart.products.push(product);
    }
    await cart.save();
    res.redirect('/products');
}
