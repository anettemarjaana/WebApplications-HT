const User = require("./../dbmodels/user");
/* Serializing and deserializing are used for session management:
> The user id is saved in the session when serializing user.
> Then it is later used to fetch the whole object through deserializeUser.
*/

const user = {
  serialize: (user, done) => {
    done(null, user.username);
  },
  deserialize: (username, done) => {
    User.findOne({ username: username }, function (err, user) {
      done(err, user);
    });
  }
};

module.exports = user;
