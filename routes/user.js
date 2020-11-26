const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../modals/user');
const passport = require('passport');
const user = require('../modals/user');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
var localStrategy = require('passport-local').Strategy;

const router = express.Router()

router.use(cookieParser('secret'));
router.use(session({
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true
}))


//passport config
router.use(passport.initialize());
router.use(passport.session());
router.use(flash());


router.use(function (req, res, next) {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
})


const checkAuthenticated =function(req,res,next){
    if(req.isAuthenticated()){
        res.set('cache-control','no-cache, private, no-store,must-revalidate,post-check=0,pre-check=0');
        return next();
    }else{
        res.redirect('login')
    }
}


router.get('/login', (req, res) => {
    res.render("login");
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/test',checkAuthenticated,(req,res) =>{
    res.render('dashboard')
})

router.get('/dashboard',checkAuthenticated, (req, res) => {
    res.render("index",{'user':req.user});
});

router.post('/register', async (req, res) => {
    var { name, email, password, password2 } = req.body;
    var err;
    if (!name || !email || !password || !password2) {
        err = "Please fill all the fields!"
        res.render('register', { 'err': err });
    }
    if (password != password2) {
        err = "Password do not match"
        res.render('register', { 'err': err })
    }
    // const hashpass = await bcrypt.hash('password', 10)
    // password = hashpass;
    if (typeof err == 'undefined') {
        user.findOne({ email: email }, function (err, data) {
            if (err) throw err
            if (data) {
                console.log('user exists');
                err = "User already exists with this email"
                res.render('register', { 'err': err, 'email': email, })
            } else {
                // const hashpass =bcrypt.hash('password',10)
                // password =hashpass;
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        password = hash;
                        user({
                            email, name, password
                        }).save((err, data) => {
                            if (err) throw err
                            req.flash('success_message', "registered successful")
                            res.redirect('login')
                        });
                    });
                });
            }
        });
    }

});


//passport

// passport.use(new localStrategy({usernameField: 'email'},(email, password, done) =>{
//     user.findOne({ email: email }, (err,data) => {
//         if (err) { return done(err);};
//         if (!data) {
//             return done(null, false,{message:"not done"});
//         }
//         bcrypt.compare(password, data.password, (err,match) => {
//             if (err) {
//                 return done(null, false,{message:"user doesnt exists"});
//             }
//             if (!match) {
//                 return done(null, false,{message:"password doesnt match"});
//             }
//             if (match) {
//                 return done(null, data)
//             }
//           });
//     });
// }));



// passport.use(new localStrategy(
//     function(email, password, done) {
//       User.findOne({ email: email }, function (err, user) {
//         if (err) { return done(err); }
//         if (!user) { return done(null, false,{message:"not done"}); }
//         // if (!user.verifyPassword(password)) { return done(null, false); }
//         return done(null, user);
//       });
//       bcrypt.compare(password, user.password, (err,isMatch) => {
//         if (err) {
//             return done(null, false,{message:"user doesnt exists"});
//         }
//         if (!match) {
//             return done(null, false,{message:"password doesnt match"});
//         }
//         if (match) {
//             return done(null, user)
//         }
//         if (isMatch) {
//             return done(null, user);
//           } else {
//             return done(null, false, { message: 'Password incorrect' });
//           }
//       });
//     }
//   ));



//   passport.serializeUser(function(user, done) {
//     done(null, user.id);
//   });

//   passport.deserializeUser(function(id, done) {
//     User.findById(id, function(err, user) {
//       done(err, user);
//     });
//   });

// passport.serializeUser(function(user,cb){
//     cb(null,user.id);
// })
// passport.deserializeUser(function(id,cb){
//     user.findById(id,function(err,user){
//         cb(err,user);
//     });
// });

passport.use(
    new localStrategy({ usernameField: 'email' }, (email, password, done) => {
        // Match user
        User.findOne({
            email: email
        }).then(user => {
            if (!user) {
                return done(null, false, { message: 'That email is not registered' });
            }

            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            });
        });
    })
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});




router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: 'dashboard',
        failureRedirect: 'login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout',(req,res) =>{
    req.logout();
    res.redirect('login');
});

module.exports = router