const Cart = require('../../models/cart-model');
const calculateCartHelper = require('../../helpers/calculate-cart'); // Import helper tính toán chung

// POST /cart/add/:productId
module.exports.add = async (req, res) => {
    try {
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity) || 1;
        const cartId = req.cartId;
        
        const product = {
            product_id: productId,
            quantity: quantity
        };

        const cart = await Cart.findById(cartId);
        if (!cart) {
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/products');
        }

        const existingProductIndex = cart.products.findIndex(item => item.product_id == productId);
        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            cart.products.push(product);
        }

        await cart.save();
        req.flash('success', 'Sản phẩm đã được thêm vào giỏ hàng'); 
        res.redirect('/products');
    } catch (error) {
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/products');
    }
};

// GET /cart
module.exports.index = async (req, res) => {
    try {
        const cartId = req.cartId;
        if (!cartId) {
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/products');
        }

        // Kiểm tra nhanh giỏ hàng tồn tại và trống hay không
        const cartCheck = await Cart.findOne({ _id: cartId }).lean();
        if (!cartCheck) {
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/products');
        }

        // Lấy chi tiết giỏ hàng và populate sản phẩm
        const cartDetail = await Cart.findOne({ _id: cartId })
            .populate({
                path: 'products.product_id',
                select: 'title price thumbnail discountPercentage slug stock',
            })
            .lean();

        // Xử lý giỏ hàng trống hoặc không có sản phẩm hợp lệ
        if (!cartDetail || !cartDetail.products || cartDetail.products.length === 0) {
            cartDetail.products = [];
            cartDetail.totalPrice = 0;
            return res.render('client/pages/cart/index', {
                cartDetail,
                pageTitle: 'Giỏ hàng của bạn'
            });
        }

        // --- SỬ DỤNG HELPER ĐỂ TÍNH TOÁN GIÁ VÀ TỔNG TIỀN ---
        const calculated = calculateCartHelper(cartDetail.products);
        cartDetail.products = calculated.products;
        cartDetail.totalPrice = calculated.totalPrice;

        res.render('client/pages/cart/index', {
            cartDetail,
            pageTitle: 'Giỏ hàng của bạn'
        });
    } catch (error) {
        console.log("LỖI CHI TIẾT GIỎ HÀNG:", error);
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/products');
    }
};

// DELETE /cart/delete/:productId
module.exports.delete = async (req, res) => {
    try {
        const cartId = req.cartId;
        const productId = req.params.productId;

        const cart = await Cart.findById(cartId);
        if (!cart) {
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/carts');
        }

        const productIndex = cart.products.findIndex(item => item.product_id == productId);
        if (productIndex === -1) {
            req.flash('error', 'Sản phẩm không tồn tại trong giỏ hàng');
            return res.redirect('/carts');
        }

        cart.products.splice(productIndex, 1);
        await cart.save();
        
        req.flash('success', 'Sản phẩm đã được xóa khỏi giỏ hàng');
        res.redirect('/carts');
    } catch (error) {
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/carts');
    }
};

// PATCH /cart/update/:productId
module.exports.update = async (req, res) => {
    try {
        const newQuantity = parseInt(req.query.quantity);
        if (isNaN(newQuantity) || newQuantity < 1) {
            req.flash('error', 'Số lượng không hợp lệ');
            return res.redirect('/carts');
        }

        const productId = req.params.productId;
        const cartId = req.cartId;

        const cart = await Cart.findById(cartId);
        if (!cart) {
            req.flash('error', 'Giỏ hàng không tồn tại');
            return res.redirect('/carts');
        }

        const productIndex = cart.products.findIndex(item => item.product_id == productId);
        if (productIndex === -1) {
            req.flash('error', 'Sản phẩm không tồn tại trong giỏ hàng');
            return res.redirect('/carts');
        }

        cart.products[productIndex].quantity = newQuantity;
        await cart.save();

        req.flash('success', 'Số lượng sản phẩm đã được cập nhật');
        res.redirect('/carts');
    } catch (error) {
        req.flash('error', 'Đã có lỗi xảy ra, vui lòng thử lại');
        res.redirect('/carts');
    }
};