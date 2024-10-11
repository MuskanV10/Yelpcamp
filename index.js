// if (process.env.NODE_ENV !== "production") {
//     require('dotenv').config();
// }
// console.log(process.env.CLOUDINARY_CLOUD_NAME);

require('dotenv').config();

const e = require('express');
const p= require('path');
const m = require('mongoose');
const ejsmate= require('ejs-mate');//embedded java script with html

const session= require('express-session')
const flash = require('connect-flash');

const ExpressError = require('./utils/expresserror');

const method= require('method-override');

const userRoutes = require('./routes/users');
const campground = require('./routes/campground'); 
const reviews = require('./routes/review'); 



const mongoSanitize = require('express-mongo-sanitize');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./modules/user');

const MongoDBStore = require("connect-mongo")(session);
const dbUrl= process.env.DB_URL
m.connect(dbUrl);
m.connection.on('error', console.error.bind(console, 'connection error:'));
m.connection.once('open', ()=>{
    console.log('database connected');
})

const a= e();




a.engine('ejs', ejsmate);

a.set('view engine', 'ejs');

a.set('views', p.join(__dirname,'views'));

a.use(e.urlencoded({extended:true}));
//Express can parse incoming request bodies with URL-encoded data, making it accessible through req.body in your route handlers
a.use(method('_method'));


a.use(e.static(p.join(__dirname,'public')))


a.use(mongoSanitize({
    replaceWith: '_'
})) // prevent NoSQL injection attacks in your Express application

const store = new MongoDBStore({
    url: dbUrl,
    secret: 'thisshouldbeabettersecret!',
    touchAfter: 24* 60*60  //resave
})
// recommended option for persisting sessions in MongoDB when using MongoDB Atlas, particularly for production applications
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
// for 14 days it lasts in session collections then it automatically gets deleted
// if logged in safari or edge along with google then 2 sessions visible
const sessionconfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
         // secure: true, //break local host as local host are not http request
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
a.use(session(sessionconfig));
a.use(flash());

a.use(passport.initialize());
a.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

a.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})




a.use('/', userRoutes);

a.use('/campground', campground)

a.use('/campground/:id/reviews', reviews)

a.get('/',(req, res)=>{
    res.render('home');
})


a.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

a.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


a.listen(3000, ()=>{
    console.log('listening on port 3000');
})