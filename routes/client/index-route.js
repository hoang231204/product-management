const productRouter = require('./product-route')
const homeRouter = require('./home-route')
const searchRouter = require('./search-route')
const cartRouter = require('./cart-route')
const checkoutRouter = require('./checkout-route')
const userRouter = require('./user-route')
const orderRouter = require('./order-route')
const blogRouter = require('./blog-route')
const contactRouter = require('./contact-route')
const ProductCategoryMiddleware = require('../../middleware/client/product-category-middleware')
const cartMiddleware = require('../../middleware/client/cart-middleware')
const userMiddleware = require('../../middleware/client/user-middleware')
const websiteInfor = require('../../middleware/client/website-infor')
module.exports = (app) => {
    app.use(websiteInfor)
    app.use(userMiddleware.checkLogin)
    app.use((req, res, next) => {
        res.locals.currentPath = req.path;
        next();
    })
    app.use(ProductCategoryMiddleware.category)
    app.use('/users', userRouter)

    app.use("/",cartMiddleware.cart,homeRouter)
    app.use("/products",cartMiddleware.cart,productRouter)
    app.use('/search',searchRouter)
    app.use('/carts',cartMiddleware.cart,cartRouter)
    app.use('/checkout',cartMiddleware.cart,checkoutRouter)
    app.use('/orders',cartMiddleware.cart,orderRouter)
    app.use('/blogs',blogRouter)
    app.use('/contact',contactRouter)
}