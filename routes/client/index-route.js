const productRouter = require('./product-route')
const homeRouter = require('./home-route')
const searchRouter = require('./search-route')
const cartRouter = require('./cart-route')
const categoryMiddleware = require('../../middleware/client/category-middleware')
const cartMiddleware = require('../../middleware/client/cart-middleware')
module.exports = (app)=>{{
    app.use(categoryMiddleware.category)
    app.use(cartMiddleware.cart)
    app.use("/",homeRouter)
    app.use("/products",productRouter)
    app.use('/search',searchRouter)
    app.use('/cart',cartRouter)
}}