const Order = require('../../models/order-model');
const Cart = require('../../models/cart-model');
const Product = require('../../models/product-model');
const calcuNewPrice = require('../../helpers/calcu-new-price');
module.exports.index = async (req, res) =>{
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
    res.render('client/pages/checkout/index', 
        {
            cartDetail: cart,
            pageTitle: 'Thanh toán'
        });
}
module.exports.order = async (req, res) =>{
    const fullname = req.body.fullname;
    const phone = req.body.phone;
    const address = req.body.address;
    let userInfor= {
        fullname: fullname,
        phone: phone,
        address: address
    }
    const cartId = req.cartId;
    const cart = await Cart.findOne({ _id: cartId }).populate('products.product_id', 'title price thumbnail discountPercentage').lean();
    if(!cart){
        req.flash('error', 'Giỏ hàng không tồn tại');
        return res.redirect('/products');
    } 
    cart.products = cart.products.filter(item => item.product_id !== null);
    if(cart.products.length === 0){
        req.flash('error', 'Giỏ hàng của bạn đang trống, không thể đặt hàng!');
        return res.redirect('/products');
    }
    cart.products.forEach(item => {
        item.product_id.priceNew = calcuNewPrice.priceNew(item.product_id.price, item.product_id.discountPercentage);
    });
    cart.totalPrice = cart.products.reduce((total, item) => {
        const itemPrice = item.product_id.priceNew * item.quantity;
        return total + itemPrice;
    }, 0);
    const products= cart.products.map(item => {
        return {
            product_id: item.product_id._id,
            price: item.product_id.price,
            discountPercentage: item.product_id.discountPercentage,
            quantity: item.quantity
        }
    });
    const order = new Order({
        cart_id: cartId,
        userInfor: userInfor,
        products: products,
        totalPrice: cart.totalPrice
    })
    if(res.locals.user){
        order.user_id = res.locals.user._id;
    }
    await order.save();
    const newCart = await Cart.findById(cartId);
    newCart.products = [];
    newCart.totalPrice = 0;
    await newCart.save();
    req.flash('success', 'Đặt hàng thành công');
    res.redirect(`/checkout/success/${order._id}`);
}
module.exports.success = async (req, res) =>{
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId}).populate('products.product_id', 'title thumbnail').lean();
    if(!order){
        req.flash('error', 'Đơn hàng không tồn tại');
        return res.redirect('/products');
    }
    order.products.forEach(item => {
        item.priceNew = calcuNewPrice.priceNew(item.price, item.discountPercentage);
    });
    res.render('client/pages/checkout/success', 
        {
            order: order,
            pageTitle: 'Đặt hàng thành công'
        });
}