const dashboardRoute = require('./dashboard-route')
const productRoute = require('./product-route')
const categoryRoute = require('./product-category-route');
const roleRoute = require('./role-route');
const accountRoute = require('./account-route');
const authRoute = require('./auth-route');
const userRoute = require('./user-route');
const orderRoute = require('./order-route');
const postRoute = require('./post-route');
const uploadRoute = require('./upload-route');
const postCategoryRoute = require('./post-category-route');
const settingGeneralRoute = require('./setting-general-route');
const privateRoute = require('../../middleware/admin/private-route');
const myProfileRoute = require('./my-profile-route');
const PATH_ADMIN = require('../../config/system')
module.exports = (app)=>{
    app.use(PATH_ADMIN.prefixAdmin+"/dashboard",privateRoute.requireAuth,dashboardRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/products",privateRoute.requireAuth,productRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/product-categories",privateRoute.requireAuth,categoryRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/accounts",privateRoute.requireAuth,accountRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/roles",privateRoute.requireAuth,roleRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/auth",authRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/my-profile",privateRoute.requireAuth,myProfileRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/users",privateRoute.requireAuth,userRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/orders",privateRoute.requireAuth,orderRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/posts",privateRoute.requireAuth,postRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/post-categories",privateRoute.requireAuth,postCategoryRoute) 
    app.use(PATH_ADMIN.prefixAdmin+"/settings",privateRoute.requireAuth,settingGeneralRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/upload-image",privateRoute.requireAuth,uploadRoute)
}
