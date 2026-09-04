const Cart = require('../../models/cart-model');
const calcuNewPrice = require('../../helpers/calcu-new-price');
//POST /cart/add/:productId
module.exports.add= async (req,res)=>{
    try{
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
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/products');
    }
}
//GET /cart
module.exports.index = async (req, res) => {
    try {
        const cartId = req.cartId;
        if (!cartId) {
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/products');
        }
        const cart = await Cart.findOne({ _id: cartId }).lean();
        if (!cart) {
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/products');
        }
        cart.products = cart.products.filter(item => item.product_id);
        if (cart.products.length === 0) {
            cart.totalPrice = 0;
            return res.render('client/pages/cart/index', {
                cartDetail: cart,
                pageTitle: 'Giỏ hàng của bạn'
            });
        }
        const validProductIds = cart.products.map(item => item.product_id);
        const cartDetail = await Cart.findOne({ _id: cartId })
            .populate({
                path: 'products.product_id',
                select: 'title price thumbnail discountPercentage slug stock',
            })
            .lean();
        cartDetail.products = cartDetail.products.filter(item => item.product_id !== null && item.product_id !== undefined);
        cartDetail.products.forEach(item => {
            item.product_id.priceNew = calcuNewPrice.priceNew(
                item.product_id.price, 
                item.product_id.discountPercentage
            );
        });
        cartDetail.totalPrice = cartDetail.products.reduce((total, item) => {
            const itemPrice = item.product_id.priceNew * item.quantity;
            return total + itemPrice;
        }, 0);
        res.render('client/pages/cart/index', {
            cartDetail: cartDetail,
            pageTitle: 'Giỏ hàng của bạn'
        });
    } catch (error) {
        console.log("LỖI CHI TIẾT GIỎ HÀNG:", error);
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/products');
    }
};
module.exports.delete = async (req,res)=>{
    try{
        const cartId = req.cartId;
        const productId = req.params.productId;
        const cart = await Cart.findById(cartId);
        if(!cart){
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/carts');
        }
        const productIndex = cart.products.findIndex(item => item.product_id == productId);
        if(productIndex === -1){
            req.flash('error', 'Sản phẩm không tồn tại trong giỏ hàng');
            return res.redirect('/carts');
        }
        cart.products.splice(productIndex, 1);
        await cart.save();
        req.flash('success', 'Sản phẩm đã được xóa khỏi giỏ hàng');
        res.redirect('/carts');
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/carts');
    }
}
module.exports.update = async (req,res)=>{
    try{
        const newQuantity = parseInt(req.query.quantity);
        if(isNaN(newQuantity) || newQuantity < 1){
            req.flash('error', 'Số lượng không hợp lệ');
            return res.redirect('/carts');
        }
        const productId = req.params.productId;
        const cartId = req.cartId;
        const cart = await Cart.findById(cartId);
        if(!cart){
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/carts');
        }
        const productIndex = cart.products.findIndex(item => item.product_id == productId);
        if(productIndex === -1){
            req.flash('error', 'Sản phẩm không tồn tại trong giỏ hàng');
            return res.redirect('/carts');
        }
        cart.products[productIndex].quantity = newQuantity;
        await cart.save();
        req.flash('success', 'Số lượng sản phẩm đã được cập nhật');
        res.redirect('/carts');
    }
    catch(error){
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/carts');
    }
}