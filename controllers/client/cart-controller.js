const Cart = require('../../models/cart-model');
const calcuNewPrice = require('../../helpers/calcu-new-price');
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
        item.product_id.priceNew = calcuNewPrice.priceNew(item.product_id.price, item.product_id.discountPercentage);
    });
    cart.totalPrice = cart.products.reduce((total, item) => {
        const itemPrice = item.product_id.priceNew * item.quantity;
        return total + itemPrice;
    }, 0);
    res.render('client/pages/cart/index', 
        {
            cartDetail: cart,
            pageTitle: 'Giỏ hàng của bạn'
        });
}
module.exports.delete = async (req,res)=>{
    const cartId = req.cartId;
    const productId = req.params.productId;
    const cart = await Cart.findById(cartId);
    if(!cart){
        req.flash('error', 'Giỏ hàng không tồn tại');
        return res.redirect('/cart');
    }
    const productIndex = cart.products.findIndex(item => item.product_id == productId);
    if(productIndex === -1){
        req.flash('error', 'Sản phẩm không tồn tại trong giỏ hàng');
        return res.redirect('/cart');
    }
    cart.products.splice(productIndex, 1);
    await cart.save();
    req.flash('success', 'Sản phẩm đã được xóa khỏi giỏ hàng');
    res.redirect('/cart');
}
module.exports.update = async (req,res)=>{
    const newQuantity = parseInt(req.query.quantity);
    if(isNaN(newQuantity) || newQuantity < 1){
        req.flash('error', 'Số lượng không hợp lệ');
        return res.redirect('/cart');
    }
    const productId = req.params.productId;
    const cartId = req.cartId;
    const cart = await Cart.findById(cartId);
    if(!cart){
        req.flash('error', 'Giỏ hàng không tồn tại');
        return res.redirect('/cart');
    }
    const productIndex = cart.products.findIndex(item => item.product_id == productId);
    if(productIndex === -1){
        req.flash('error', 'Sản phẩm không tồn tại trong giỏ hàng');
        return res.redirect('/cart');
    }
    cart.products[productIndex].quantity = newQuantity;
    await cart.save();
    req.flash('success', 'Số lượng sản phẩm đã được cập nhật');
    res.redirect('/cart');
}