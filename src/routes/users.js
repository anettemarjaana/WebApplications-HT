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

/* The Settings-page will be in an address ".../users/edit". 
This function renders the settings view and prefills the form fields with
the selected user. 
Only a logged in user is allowed to use settings. */
router.get(
  "/settings/:urlSlug",
  redirectIfNotAuthenticated,
  async (req, res) => {
    const user = await User.findOne({ urlSlug: req.params.urlSlug });
    console.log("Found user " + user.username);

    /* Find all users in the database to give settings as permitted users options.
    Render them in an alphabetical order. */
    const blogUsers = await User.find().sort({ username: 1 });
    /* Remove the user itself from this list: */
    for (var i = 0; i < blogUsers.length; i++) {
      if (blogUsers[i] === user) {
        blogUsers.splice(i, 1);
        break;
      }
    }

    /* Render the settings for this specific user */
    res.render("users/settings", {
      user: user,
      blogUsers: blogUsers
    });
  }
);

/* Once the Register-button is hit, this function gets ran.
This function should only be available for non-authenticated users. */
router.post(
  "/",
  redirectIfAuthenticated,
  async (req, res, next) => {
    console.log("Sign up submit button was hit");
    req.user = new User();
    next();
  },
  saveUser("signup")
);

/* A function for submitting user settings. User is redirected to their own profile */
router.put(
  "/:urlSlug",
  redirectIfNotAuthenticated,
  async (req, res, next) => {
    console.log("Settings submit button was hit");
    req.user = await User.findOne({ urlSlug: req.params.urlSlug });
    next();
  },
  saveSettings("profile")
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
  const user = await User.findOne({ username: req.user.username });
  console.log("Redirecting to user's profile: " + user.username);
  if (user == null) {
    console.log("No user found");
    /* if there's no authenticated user (in case) */
    res.redirect("/"); /* redirect to home page */
  } else {
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
* options of "visible to" variable:
  - everyone
  - authenticated
  - specified 
  - myself
  */
router.get("/:authorSlug", async (req, res) => {
  const feedSlug = req.params.authorSlug;
  const user = await User.findOne({ urlSlug: feedSlug });
  if (user == null) {
    // If the urlSlug is faulty = if there's no such user
    console.log("No user found with given slug " + feedSlug);
    res.redirect("/posts/index");
  }

  const feedVisible = user.visibleTo;
  let pass = 0; // Pass 0 means the user can not access the page, 1 means access is granted

  console.log("feedVisible: " + feedVisible);
  /* Fetch the user from the database of users */
  /* These visibility permissions don't depend on whether the user is authenticated
  or not: */
  if (feedVisible === "me") {
    // Should not happen as those posts should never be visible
    res.redirect("/posts/index");
  }
  if (feedVisible === "all") {
    pass = 1;
  }

  /* These permissions take an authenticated user reaching the feed: */
  if (req.isAuthenticated()) {
    /* If the user clicked their own name, redirect them to their own page */
    if (feedSlug === req.user.urlSlug) {
      console.log("The user clicked their own name. Redirecting to profile.");
      res.redirect("/users/profile");
    }
    if (feedVisible === "registered") {
      pass = 1;
    } else if (feedVisible === "specified") {
      /* Check whether this user is on the blog's list of permitted users */
      if (user.permittedUsers.includes(req.user.username)) {
        pass = 1;
      } else {
        pass = 0;
        res.redirect("/posts/index");
      }
    }
  }
  /* If the reaching user has passed all the requirements: */
  if (pass === 1) {
    console.log("Pass: " + pass);
    /* Find the blog posts written by this author and render them only */
    const blogPosts = await Post.find({ authorSlug: feedSlug }).sort({
      timeStamp: "desc"
    });
    res.render("users/feed", {
      user: user,
      blogPosts: blogPosts,
      viewer: req.user
    });
  } else {
    console.log("Pass: " + pass);
    res.redirect("/posts/index");
  }
});

/* A function for logging out and redirecting back to log in page */
router.delete("/logout", redirectIfNotAuthenticated, (req, res) => {
  req.logOut(); // clear the session and log the user out
  console.log("Log out successful. Redirect to front page.");
  res.redirect("/");
});

/* This function is used in sign up and settings of the user: */
function saveUser(path) {
  return async (req, res) => {
    /* Fetch the information of the user from the _formfields
    and save them in the database */
    let user = req.user;
    /* Check if the username is already taken */
    const checkUser = await User.findOne({ username: req.body.username });
    if (checkUser) {
      if (checkUser.username === user.username) {
        let message = "This username is not available.";
        res.render(`users/${path}`);
        console.log(message);
        req.flash("info", message);
      }
    }
    user.username = req.body.username;
    /* Use bcrypt and a hashed password for securing the password: */
    const securePassword = await bcrypt.hash(req.body.password, 10);
    user.password = securePassword;
    /* set the new access permission */
    user.visibleTo = req.body.visibleTo;

    /* If the access permission is "specified", the user itself should be
    included in the permittedUsers list:*/
    if (user.visibleTo === "specified") {
      if (!user.permittedUsers.includes(user.username)) {
        user.permittedUsers.push(user.username);
      }
    } else {
      // with any other permission setting
      user.permittedUsers = []; // empty the array of permitted users
    }

    console.log("### new user signed up: ###");
    console.log(user);

    /* If there's a success:
    Wait till the user is saved in database and then redirect
      to page /users/profile
    */
    try {
      user = await user.save();
      console.log("Inserted 1 user");

      /* Passport login function to establish a login session: */
      req.login(user, function (err) {
        if (err) {
          console.log(err);
          res.render(`users/${path}`);
          req.flash("info", "Login session failed.");
        }
        res.redirect("/users/profile");
      });
    } catch (e) {
      /* If a required information is missing 
       --> stay on the same page*/
      console.log(e);
      res.render(`users/${path}`);
    }
  };
}

/* This function proceeds with the settings of the user: */
function saveSettings(path) {
  return async (req, res) => {
    /* Fetch the information of the user from the _formfields
    and save them in the database */
    let user = req.user;

    /* If the password field has been filled (not mandatory in Settings) */
    if (req.body.password) {
      /* Use bcrypt and a hashed password for securing the password: */
      const securePassword = await bcrypt.hash(req.body.password, 10);
      user.password = securePassword;
    } else {
      /* If it's not been filled, use the original password. */
      user.password = req.user.password;
    }

    /* if the visiblity setting is selected: */
    if (req.body.visibleTo) {
      /* set the new access permission */
      user.visibleTo = req.body.visibleTo;

      /* If the access permission is "specified", the user itself should be
    included in the permittedUsers list:*/
      if (user.visibleTo === "specified") {
        if (!user.permittedUsers.includes(user.username)) {
          user.permittedUsers.push(user.username);
          console.log("User: " + user.username + " added on permittedUsers");
        }
        /* If the user specified a user that should be granted a permission: */
        if (req.body.permittedUser) {
          /* the permittedUser value is already user.username on settings page: */
          if (user.permittedUsers.includes(req.body.permittedUser)) {
            let message = "This user already is allowed to see your blog.";
            console.log(message);
            res.render(`/users/${path}`);
            req.flash("info", message);
          } else {
            /* If the list does not include this name yet: */
            user.permittedUsers.push(req.body.permittedUser);
            console.log(
              "User: " + req.body.permittedUser + " added on permittedUsers"
            );
          }
        }
      } else {
        // with any other permission setting
        user.permittedUsers = []; // empty the array of permitted users
      }
    } else {
      /* If no new visibility restriction is set this time */
      user.visibleTo = req.user.visibleTo;
    }
    console.log("### new user settings ###");
    console.log(user);

    /* If there's a success:
    Wait till the user is saved in database and then redirect
      to page /users/profile
    */
    try {
      user = await user.save();
      console.log("Settings saved successfully. Redirecting.");
      res.redirect(`/users/${path}`);
    } catch (e) {
      /* If a required information is missing */
      console.log(e);
      res.render(`/users/${path}`);
    }
  };
}

module.exports = router;
