const dashboardRoute = require('./dashboard-route')
const productRoute = require('./product-route')
const categoryRoute = require('./category-route');
const roleRoute = require('./role-route');
const accountRoute = require('./account-route');
const authRoute = require('./auth-route');
const privateRoute = require('../../middleware/admin/private-route');
const PATH_ADMIN = require('../../config/system')
module.exports = (app)=>{
    app.use(PATH_ADMIN.prefixAdmin+"/dashboard",privateRoute,dashboardRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/products",privateRoute,productRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/categories",privateRoute,categoryRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/accounts",privateRoute,accountRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/roles",privateRoute,roleRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/auth",authRoute)
}
