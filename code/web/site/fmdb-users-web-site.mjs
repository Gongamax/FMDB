// Module responsibilities
// Have the functions that handle HTTP requests

import express from "express";
import passport from "passport";
import expressSession from "express-session";
import errors from "../../errors.mjs";

export default function (services) {
  if (!services) {
    throw errors.INVALID_PARAMETER("services");
  }

  const app = express.Router();

  app.use(
    expressSession({
      secret: "Portugal campeão",
      resave: false,
      saveUninitialized: false,
    })
  );

  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  app.use("/auth", verifyAuthenticated); // Verify authentication middleware

  app.get("/register", getSignUpView); // SignUp View
  app.post("/register", signUp); // Get a form to create a user
  app.get("/login", loginForm); // Get the login form
  app.post("/login", validateLogin); // Verify login credentials
  app.post("/logout", logout); // logout

  return app;

  function verifyAuthenticated(req, rsp, next) {
    if (req.user) return next();
    rsp.redirect("/login");
  }

  function getSignUpView(req, rsp) {
    rsp.render("newUser");
  }

  function signUp(req, rsp) {
    services
      .createUser(req.body.username, req.body.password)
      .then(() => loginForm(req, rsp))
      .catch((error) => rsp.render("newUser"));
  }

  function loginForm(req, rsp) {
    rsp.render("login", { user: req.user });
  }

  async function validateLogin(req, rsp) {
    try {
      const user = await services.validateCredentials(
        req.body.username,
        req.body.password
      );
      if (user) {
        rsp.cookie("token", user.token, {
          maxAge: 900000, // in milliseconds
          httpOnly: true, // accessible only by the server
          secure: true, // only sent over HTTPS
        });
        req.login(
          {
            username: user.userName,
            token: user.token,
          },
          () => rsp.redirect(`/auth/home`)
        );
      } else {
        rsp.redirect("/login");
      }
    } catch (err) {
      console.log(err);
      rsp.status(500).json({ error: "An error occured" });
    }
  }

  function logout(req, rsp) {
    req.logout((err) => rsp.redirect("/home"));
  }
}
