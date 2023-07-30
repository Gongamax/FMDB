// Module responsibilities
// Have the functions that handle HTTP requests

import express from 'express'
import passport from 'passport'
import expressSession from 'express-session'
import errors from '../../errors.mjs'


export default function(services) {
    if(!services) {
        throw errors.INVALID_PARAMETER('services')
    }

    const app = express.Router()

    app.use(expressSession(
        {
          secret: "Benfica campeão",
          resave: false,
          saveUninitialized: false
        }
        ))

    // Passport initialization
    app.use(passport.initialize())
    app.use(passport.session())

    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => done(null, user))    
    
    app.get("/users", getSignUpView)                // SignUp View
    app.post("/users", postSignUp)                  // Get a form to create a user 
    app.use('/users', verifyAuthenticated)          // Verify authentication middleware
    app.get('/login', loginForm)                    // Get the login form
    app.post('/login', login)                       // Verify login credentials
    app.post('/logout', logout)                      // logout
    
    return app

    function verifyAuthenticated(req, rsp, next) {
        if(req.user)
            return next()
        rsp.redirect('/login')
    } 

    function getSignUpView(req, rsp){
        rsp.render('newUser')
    }

    function postSignUp(req, rsp){
        services.createUser(req.body.username, req.body.password)
            .then(() => loginForm(req,rsp))
            .catch(error => rsp.render('newUser'))
    }


    function loginForm(req, rsp) {
        rsp.render('login')
    }

    async function login(req, rsp) {
        try {
            const token = await services.validateCredentials(req.body.username, req.body.password)
            console.log(token)
            if(token) {
                rsp.cookie('token', token, {
                    maxAge: 900000, // in milliseconds
                    httpOnly: true, // accessible only by the server
                    secure: true // only sent over HTTPS
                });
                req.token = token
                req.login(token, () => rsp.redirect(`/users/${token}/groups`))
            } else {
                rsp.render('login', {username: req.body.username, message: "Invalid credentials"})
            }
        } catch (err) {
            console.log(err);
            rsp.status(500).json({ error: 'An error occured' });
        }
    }
    
    function logout(req, rsp) {
        req.logout(() => rsp.redirect('/home'))
    }
}