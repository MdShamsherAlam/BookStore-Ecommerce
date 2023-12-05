const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");


const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const productsControllers = require('./controllers/error')
const User = require('./models/user')
const csrf = require('csurf')
const flash = require('connect-flash')
const multer = require('multer')
const { format } = require('date-fns');

const app = express();
const MONGODB_URI = 'mongodb+srv://MdShamsher:R2BQhKtUA0nCfD4f@cluster0.nwebdck.mongodb.net/shop?retryWrites=true&w=majority'
//this is for storing session in database
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'

})
const csrfProtection = csrf()                                               //this is for csrf 

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      const date = format(new Date(), 'yyyy-MM-dd-HH-mm-ss'); // Format the date without special characters
      cb(null, date + '-' + file.originalname);
    },
  });
  const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/png' ||file.mimetype==='image/jpeg' ||file.mimetype==='image/jpg'){
        cb(null,true)
    }else{
        cb(null,false)
    }
  }
//implementing ejs for dynamic content
app.set('view engine', 'ejs')
app.set('views', 'views');

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage:fileStorage,fileFilter:fileFilter }).single('image'))

app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));


app.use(session({
    secret: 'my-secret',
    resave: false,                            //resave:false, means we don't want to store session for every request
    saveUninitialized: false,
    store: store                              //for storing data in database
}))

app.use(csrfProtection)
app.use(flash())

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})


app.use((req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
        .then(user => {
            // throw new Error('Dummy')
            if (!user) {
                return next()
            }
            req.user = user;
            // req.userId = user._id;
            next();
        })
        .catch(err => {
            next(new Error(err))
        })


})

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use('/500', productsControllers.get500);
app.use(productsControllers.get404);
//this is special middle ware that is inbuilt for error it has four argument
app.use((error, req, res, next) => {
    console.log(error)
    // res.redirect('/500')
    res.status(500).render('500',
        {
            pageTitle: 'Error!',
            path: '/500',
            isAuthenticated: req.session.isLoggedIn
        })
})



mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(3000)
        console.log("SERVER IS RUNNING")
    }).catch(err => {
        console.log(err)
    })