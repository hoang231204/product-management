const Cart = require('../../models/cart-model');
const priceNew = require('../../helpers/calcu-new-price');
//POST /cart/add/:productId
module.exports.add= async (req,res)=>{
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity) || 1;
    const cartId = req.cartId;
    let product = {
        product_id: productId,
        quantity: quantity
    }
    const cart = await Cart.findById(cartId);
    if(!cart){
        req.flash('error', 'Giỏ hàng không tồn tại');
        return res.redirect('/products');
    }
    const existingProductIndex = cart.products.findIndex(item => item.product_id == productId);
    if(existingProductIndex !== -1){
        cart.products[existingProductIndex].quantity += quantity;
    }
    else{
        cart.products.push(product);
    }
    await cart.save();
    req.flash('success', 'Sản phẩm đã được thêm vào giỏ hàng'); 
    res.redirect('/products');
}
//GET /cart
module.exports.index = async (req,res)=>{
    const cartId = req.cartId;
    const cart = await Cart.findOne({ _id: cartId }).populate('products.product_id', 'title price thumbnail discountPercentage').lean();
    if(!cart){
        req.flash('error', 'Giỏ hàng không tồn tại');
        return res.redirect('/products');
    }
    cart.products = cart.products.filter(item => item.product_id !== null);
    cart.products.forEach(item => {
        item.product_id.priceNew = priceNew(item.product_id.price, item.product_id.discountPercentage);
    });
    cart.totalPrice = cart.products.reduce((total, item) => {
        const itemPrice = item.priceNew * item.quantity;
        return total + itemPrice;
    }, 0);
    res.render('client/pages/cart/index', 
        {
            cartDetail: cart,
            pageTitle: 'Giỏ hàng của bạn'
        });
}