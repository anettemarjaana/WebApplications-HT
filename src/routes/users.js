const express = require("express");
const User = require("./../dbmodels/user"); // schema for creating new posts
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const localAuth = require("passport-local").Strategy;

/* Using a function to initialize the user authentication to work as wished
in every login: */
initializePassport(passport);

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
be triggered (express-session) */
router.post("/login", redirectIfAuthenticated, async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  console.log(
    "User found, username: " + user.username + " and urlSlug: " + user.urlSlug
  );
  passport.authenticate("local", {
    successRedirect: `/users/${user.urlSlug}`,
    successFlash: "Welcome back!",
    failureRedirect: "/users/login",
    failureFlash: true
  });
  console.log("Authentication done. Redirected.");
});

/* User's own page: 
- shown when signed up or logged in
- also when user clicks "Own page" button */
router.get("/:urlSlug", async (req, res) => {
  const user = await User.findOne({ urlSlug: req.params.urlSlug });
  if (user == null) {
    /* if the slug in the address is incorrect*/
    res.redirect("/"); /* redirect to home page */
  } else {
    /* redirect to user's own page */
    res.render("users/ownpage", {
      user: user
    });
  }
});

/* A function for logging out and redirecting back to log in page */
router.delete("/logout", (req, res) => {
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
      res.redirect(`/users/${user.urlSlug}`);
      console.log("Redirection done");
    } catch (e) {
      /* If a required informatinon is missing */
      /* Stay on the same page*/
      console.log(e);
      res.render(`users/${path}`);
    }
  };
}

/* This function is called in the beginning of the router to initialize the
passport authentication. */
async function initializePassport(passport) {
  let message = "";
  const userAuthentication = async (username, password, done) => {
    const user = await User.findOne({ username: username });
    if (user == null) {
      /* The user is not found by the username:
      Return the result and pop a message to the user. */

      message = "No user found with the given username.";
      return done(null, false, message);
    }
    /* A user with the given username was found
    -> Compare the password to the entered password. */
    try {
      pwComparison = await bcrypt.compare(password, user.password);
      if (pwComparison) {
        /* Password correct */
        return done, user;
      } else {
        /* Password incorrect */
        message = "Password was incorrect. Please try again.";
        return done(null, false, message);
      }
    } catch (error) {
      /* Comparison failed. */
      return done(error);
    }
  };
  const findUserById = async (id) => {
    const user = await User.findById(id);
    return user;
  };
  /* Call to the userAuthentication function above: */
  passport.use(
    new localAuth({ usernameField: "username" }, userAuthentication)
  );
  /* After authentication is finished: */
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    return done(null, findUserById(id));
  });
}

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
    return next();
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
  next();
}

module.exports = router;
