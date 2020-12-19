/* redirectIfAuthenticated:
SEE IF USER HAS ALREADY LOGGED IN BUT STILL TRIES TO LOG IN
-> Prevent the user from doing authentication on top of authentication
* sign up and log in pages should be hidden from the authenticated users */
function redirectIfAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // if logged in
    return res.redirect("/posts/index"); // redirect to posts index
  }
  // If not authenticated: allow whatever action
  next();
}

module.exports = redirectIfAuthenticated;
