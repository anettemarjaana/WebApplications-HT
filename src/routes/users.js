const express = require("express");
const User = require("./../dbmodels/user"); // schema for creating new posts
const router = express.Router();
const bcrypt = require("bcrypt");

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
  "/",
  async (req, res, next) => {
    req.user = new User();
    next();
  },
  saveUser("signup")
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

    try {
      /* If there's a success: */
      /* Wait till the user is saved in database and then redirect to page /users/id 
      THIS OR TO LOGIN?*/
      post = await user.save();
      console.log("Inserted 1 user");
      res.redirect(`/users/${user.urlSlug}`);
      console.log("Redirection done");
    } catch (e) {
      /* If a required information is missing */
      /* Stay on the same page*/
      console.log(e);
      res.render("users/${path}", {
        user: user /* The fields will be prepopulated with the failed user. */
      });
    }
  };
}

module.exports = router;
