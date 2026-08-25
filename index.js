const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT;
const routeClient  = require('./routes/client/index-route')
const routeAdmin = require("./routes/admin/index-route")
const database = require("./config/database")
const redis = require("./config/redis")
const pathAdmin = require('./config/system')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash');
const { startOrderExpirationWorker, stopOrderExpirationWorker } = require('./workers/orderExpirationWorker');
const cookieParser = require('cookie-parser')
const path = require('path');
const moment = require('moment');
//Mongoose
database.connect();
//Redis
redis.connect();
//setting pug
app.set('views', `${__dirname}/views`)
app.set('view engine', 'pug')
//APP LOCAL
app.locals.prefixAdmin = pathAdmin.prefixAdmin
app.locals.moment = moment;
//static file
app.use(express.static(`${__dirname}/public`));
//method-override
app.use(methodOverride("_method"));
//body-parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
//connect-flash

app.use(cookieParser("keyboard cat"));

app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true
}));

app.use(flash()); 

app.use((req, res, next) => {
  res.locals.messages = {
    success: req.flash("success"),
    error: req.flash("error")
  };
  next();
});
//tinyMCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));


//routes
routeClient(app);
routeAdmin(app)
//error
app.use(/.*/, (req, res) => {
  res.status(404).render('client/pages/error/404', {
    pageTitle: "404 Not Found"
  });
});

//message
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  startOrderExpirationWorker();
})

//Graceful shutdown
const gracefulShutdown = async () => {
    console.log("\n[App] Đang tắt server...");
    stopOrderExpirationWorker();
    await redis.disconnect();
    process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);