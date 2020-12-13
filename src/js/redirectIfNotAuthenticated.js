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

  res.redirect("/users/login"); // Redirect to log in if not logged in
}

module.exports = redirectIfNotAuthenticated;
