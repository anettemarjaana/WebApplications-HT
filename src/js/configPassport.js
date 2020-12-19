const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./../dbmodels/user");

/* BEGINNING OF AUTHENTICATION PROCESS */
console.log("### Passport authentication process ###");
passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true
    },
    async function (req, username, password, done) {
      let message = ""; // used for flash and console logs

      const user = await User.findOne({ username: username });
      if (user == null) {
        /* The user is not found by the username:
          Return the result and pop a message to the user. */
        message = "No user found with the given username.";
        console.log(message);
        return done(null, false, message);
      }
      /* A user with the given username was found
        -> Compare the password to the entered password. */
      try {
        pwComparison = await bcrypt.compare(password, user.password);
        if (pwComparison) {
          /* Password correct */
          return done(null, user);
        } else {
          /* Password incorrect */
          message = "Password was incorrect. Please try again.";
          console.log(message);
          return done(null, false, message);
        }
      } catch (error) {
        /* Comparison failed. */
        console.log("Auth comparison failed");
        return done(error);
      }
    }
  )
);

module.exports = passport;
