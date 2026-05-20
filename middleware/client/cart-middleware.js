const Cart = require('../../models/cart-model');

module.exports.cart = async (req, res, next) => {
  try {
    let cart = null;
    if (res.locals.user) {
      cart = await Cart.findOne({ user_id: res.locals.user._id });
      if (cart) {
        if (req.cookies.cartId && req.cookies.cartId !== cart._id.toString()) {
          const guestCart = await Cart.findById(req.cookies.cartId);
          if (guestCart) {
            if (guestCart.products && guestCart.products.length > 0) {
              guestCart.products.forEach(guestItem => {
                const existingItem = cart.products.find(
                  item => item.product_id.toString() === guestItem.product_id.toString()
                );
                if (existingItem) {
                  existingItem.quantity += guestItem.quantity;
                } else {
                  cart.products.push(guestItem);
                }
              });
              await cart.save();
            }
            await Cart.findByIdAndDelete(req.cookies.cartId);
          }
        }
        res.cookie('cartId', cart._id.toString(), { maxAge: 1000 * 60 * 60 * 24 * 7 });
        req.cartId = cart._id.toString();
      } 
      else {
        if (req.cookies.cartId) {
          cart = await Cart.findById(req.cookies.cartId);
        }
        if (cart) {
          cart.user_id = res.locals.user._id;
          await cart.save();
        } else {
          cart = new Cart({ user_id: res.locals.user._id });
          await cart.save();
        }
        res.cookie('cartId', cart._id.toString(), { maxAge: 1000 * 60 * 60 * 24 * 7 });
        req.cartId = cart._id.toString();
      }
    } 
    else {
      if (req.cookies.cartId) {
        cart = await Cart.findById(req.cookies.cartId);
      }
      if (!cart) {
        cart = new Cart();
        await cart.save();
        res.cookie('cartId', cart._id.toString(), { maxAge: 1000 * 60 * 60 * 24 * 7 });
      }
      req.cartId = cart._id.toString();
    }
    
    res.locals.miniCartCount = cart 
      ? cart.products.reduce((sum, item) => sum + item.quantity, 0) 
      : 0;

    next();
  } catch (error) {
    console.error("Lỗi xử lý middleware giỏ hàng:", error);
    res.status(500).send("Lỗi hệ thống");
  }
};