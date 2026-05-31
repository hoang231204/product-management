const dashboardRoute = require('./dashboard-route')
const productRoute = require('./product-route')
const categoryRoute = require('./product-category-route');
const roleRoute = require('./role-route');
const accountRoute = require('./account-route');
const authRoute = require('./auth-route');
const userRoute = require('./user-route');
const orderRoute = require('./order-route');
const postRoute = require('./post-route');
const postCategoryRoute = require('./post-category-route');
const privateRoute = require('../../middleware/admin/private-route');
const myProfileRoute = require('./my-profile-route');
const PATH_ADMIN = require('../../config/system')
module.exports = (app)=>{
    app.use(PATH_ADMIN.prefixAdmin+"/dashboard",privateRoute.requireLogin,dashboardRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/products",privateRoute.requireLogin,productRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/product-categories",privateRoute.requireLogin,categoryRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/accounts",privateRoute.requireLogin,accountRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/roles",privateRoute.requireLogin,roleRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/auth",authRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/my-profile",privateRoute.requireLogin,myProfileRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/users",privateRoute.requireLogin,userRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/orders",privateRoute.requireLogin,orderRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/posts",privateRoute.requireLogin,postRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/post-categories",privateRoute.requireLogin,postCategoryRoute)  
}
