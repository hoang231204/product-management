const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT;
const routeClient  = require('./routes/client/index-route')
const routeAdmin = require("./routes/admin/index-route")
const database = require("./config/database")
const path = require('./config/system')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash');
const cookieParser = require('cookie-parser')

//Mongoose
database.connect();
//setting pug
app.set('views', `${__dirname}/views`)
app.set('view engine', 'pug')
//APP LOCAL
app.locals.prefixAdmin = path.prefixAdmin
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



//routes
routeClient(app);
routeAdmin(app)


//message
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
