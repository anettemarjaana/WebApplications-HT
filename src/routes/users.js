const express = require("express");
const User = require("./../dbmodels/user");
const Post = require("./../dbmodels/post");
const bcrypt = require("bcrypt");
const router = express.Router();

/* Using a function to initialize the user authentication to work as wished
in every login: */
const passport = require("./../js/configPassport");
/* Checking if the user is authenticated to see certain pages based on 
if there is an ongoing session or not: */
const redirectIfAuthenticated = require("./../js/redirectIfAuthenticated");
const redirectIfNotAuthenticated = require("./../js/redirectIfNotAuthenticated");

/* This function is used on the forms that require password (Log in and Sign up)*/
function showPassword() {
  var fieldInput = document.getElementById("password");
  if (fieldInput.type === "password") {
    fieldInput.type = "text";
  } else {
    fieldInput.type = "password";
  }
}

/* The Sign Up -page will be in an address ".../users/signup". 
This function should only be available for non-authenticated users. */
router.get("/signup", redirectIfAuthenticated, (req, res) => {
  res.render("users/signup", {
    user: new User(),
    showPassword()
  });
});

/* The Log In -page will be in an address ".../users/login". */
router.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("users/login", {
    showPassword()});
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
- also when user clicks "Own page" button or their own name on the list of all posts */
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
    /* Find the blog posts written by this author and render them only */
    const blogPosts = await Post.find({ authorSlug: req.user.urlSlug }).sort({
      timeStamp: "desc"
    });
    /* redirect to user's own page */
    res.render("users/profile", {
      user: user,
      blogPosts: blogPosts
    });
  }
});

/* Viewing other users' feeds: 
NOW ONLY WORKING IF A USER IS LOGGED IN. */
router.get("/:authorSlug", async (req, res) => {
  const feedSlug = req.params.authorSlug;
  console.log(
    "The user " + req.user.username + " wants to reach feed: " + feedSlug
  );
  /* If the user clicks their own name, redirect them to their own page */
  if (feedSlug === req.user.urlSlug) {
    console.log("The user clicked their own name. Redirecting to profile.");
    res.redirect("/users/profile");
  }
  const user = await User.findOne({ urlSlug: feedSlug });

  if (user == null) {
    // If the urlSlug is faulty = if there's no such user
    console.log("No user found with given slug " + feedSlug);
    res.redirect("/"); /* redirect the user to home page */
  } else {
    /* Find the blog posts written by this author and render them only */
    const blogPosts = await Post.find({ authorSlug: feedSlug }).sort({
      timeStamp: "desc"
    });
    res.render("users/feed", {
      user: user,
      blogPosts: blogPosts
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
    /* Check if the username is already taken */
    const checkUser = await User.findOne({ username: user.username });
    if (checkUser) {
      if (checkUser.username === user.username) {
        let message = "This username is not available.";
        console.log(message);
        req.flash(message);
        res.render(`users/${path}`);
      }
    }
    /* Use bcrypt and a hashed password for securing the password: */
    const securePassword = await bcrypt.hash(req.body.password, 10);
    user.password = securePassword;

    console.log("Got password and the username " + user.username);
    try {
      /* If there's a success: */
      /* Wait till the user is saved in database and then redirect to page /users/id 
      THIS OR TO LOGIN?*/
      user = await user.save();
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

module.exports = router;
