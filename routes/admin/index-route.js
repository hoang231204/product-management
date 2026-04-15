const dashboardRoute = require('./dashboard-route')
const productRoute = require('./product-route')
const PATH_ADMIN = require('../../config/system')
module.exports = (app)=>{
   
    app.use(PATH_ADMIN.prefixAdmin+"/dashboard",dashboardRoute)
    app.use(PATH_ADMIN.prefixAdmin+"/products",productRoute)
    
}
