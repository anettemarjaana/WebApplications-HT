const express = require("express");
const User = require("./../dbmodels/user"); // schema for creating new posts
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const localAuth = require("passport-local").Strategy;

initializePassport(passport);

/* The Sign Up -page will be in an address ".../users/signup". */
router.get("/signup", (req, res) => {
  res.render("users/signup", {
    user: new User()
  });
});

/* The Log In -page will be in an address ".../users/login". */
router.get("/login", (req, res) => {
  res.render("users/login");
});

/* Once the Register-button is hit, this function gets ran: */
router.post(
  "/signup",
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
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/ownpage",
    failureRedirect: "/login",
    failureFlash: true
  })
);

function saveUser(path) {
  return async (req, res) => {
    /* Fetch the information of the user from the _formfields
    and save them in the database */
    let user = req.user;
    user.username = req.body.username;
    /* Use bcrypt and a hashed password for securing the password: */
    const securePassword = await bcrypt.hash(req.body.password, 10);
    user.password = securePassword;

    console.log("Got username and password");
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
      res.render("users/${path}", {
        user: user /* The fields will be prepopulated with the failed user. */
      });
    }
  };
}

/* User's own page: */
router.get("/:urlSlug", async (req, res) => {
  const user = await User.findOne({ urlSlug: req.params.urlSlug });
  if (user == null) {
    /* if the id in the address is incorrect*/
    res.redirect("/"); /* redirect to home page */
  } else {
    res.render("users/ownpage", {
      user: user
    });
  }
});

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
  /* Call to the authentication function above: */
  passport.use(new localAuth(userAuthentication));
  /* After authentication is finished: */
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    return done(null, findUserById(id));
  });
}

module.exports = router;
