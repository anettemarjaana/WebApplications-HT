const express = require("express");
const User = require("./../dbmodels/user");
const bcrypt = require("bcrypt");
const localAuth = require("passport-local").Strategy;
const router = express.Router();
/* Using a function to initialize the user authentication to work as wished
in every login: */
const passport = require("./../js/configPassport");

/* The Sign Up -page will be in an address ".../users/signup". 
This function should only be available for non-authenticated users. */
router.get("/signup", redirectIfAuthenticated, (req, res) => {
  res.render("users/signup", {
    user: new User()
  });
});

/* The Log In -page will be in an address ".../users/login". */
router.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("users/login");
});

/* Once the Register-button is hit, this function gets ran.
This function should only be available for non-authenticated users. */
router.post(
  "/",
  redirectIfAuthenticated,
  async (req, res, next) => {
    console.log("Register button was hit");
    req.user = new User();
    next();
  },
  saveUser("signup")
);

/* Once the Log in -button is hit, the program will proceed with
the user authentication (passport libraries) and the user session will
be triggered (express-session): http://www.passportjs.org/docs/login/ */
router.post("/login", redirectIfAuthenticated, (req, res, next) => {
  const handler = passport.authenticate("local", {
    successRedirect: "/users/profile",
    successFlash: "Welcome back!",
    failureRedirect: "/users/login",
    failureFlash: true
  });
  handler(req, res, next);
});

/* User's own page: 
- shown when signed up or logged in
- also when user clicks "Own page" button */
router.get("/profile", redirectIfNotAuthenticated, async (req, res) => {
  console.log("Redirecting the user " + req.user.username + " to own profile");
  const user = await User.findOne({ username: req.user.username });
  if (user == null) {
    console.log("No user found");
    /* if there's no authenticated user (in case) */
    res.redirect("/"); /* redirect to home page */
  } else {
    console.log(req.user);
    console.log(req.isAuthenticated());
    /* redirect to user's own page */
    res.render("users/profile", {
      user: user
    });
  }
});

/* A function for logging out and redirecting back to log in page */
router.delete("/logout", redirectIfNotAuthenticated, (req, res) => {
  req.logOut(); // clear the session and log the user out
  console.log("Log out successful. Redirect to front page.");
  res.redirect("/");
});

function saveUser(path) {
  return async (req, res) => {
    /* Fetch the information of the user from the _formfields
    and save them in the database */
    let user = req.user;
    user.username = req.body.username;
    /* Use bcrypt and a hashed password for securing the password: */
    const securePassword = await bcrypt.hash(req.body.password, 10);
    user.password = securePassword;

    console.log("Got password and the username " + user.username);
    try {
      /* If there's a success: */
      /* Wait till the user is saved in database and then redirect to page /users/id 
      THIS OR TO LOGIN?*/
      post = await user.save();
      console.log("Inserted 1 user");

      /* Passport login function to establish a login session: */
      req.login(user, function (err) {
        if (err) {
          console.log(err);
          res.render(`users/${path}`);
        }
        res.redirect("/users/profile");
      });
    } catch (e) {
      /* If a required informatinon is missing */
      /* Stay on the same page*/
      console.log(e);
      res.render(`users/${path}`);
    }
  };
}

/* REDIRECTION FUNCTIONS DEPENDING ON SESSIONS: */

/* redirectIfNotAuthenticated is a function that checks whether the user is a logged in
user. If it's not, it will be redirecting the user to log in.
This function is called on pages that is for authenticated users only.
The isAuthenticated function that this function is using comes with the passport

Note: Login page should have an option to view public posts without logging in.
* log out page and button should be only visible to logged in users
 */
function redirectIfNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // If the user is logged in
    return next(); // Allow whatever action
  }

  res.redirect("/login"); // Redirect to log in if not logged in
}

/* redirectIfAuthenticated:
SEE IF USER HAS ALREADY LOGGED IN BUT STILL TRIES TO LOG IN
-> Prevent the user from doing authentication on top of authentication
* sign up and log in pages should be hidden from the authenticated users */
function redirectIfAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // if logged in
    return res.redirect("/"); // redirect to home page
  }
  // If not authenticated: allow whatever action
  next();
}

module.exports = router;
