require("dotenv").config();
const express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var Promise = require("bluebird");
const Post = require("./../dbmodels/post");
const methodOverride = require("method-override");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const app = express();

/* Routers for handling users and their blog posts */
const postRouter = require("../routes/posts");
const userRouter = require("../routes/users");

/* BUILD THE DATABASE CONNECTION like in express-mongo demo:
https://bitbucket.org/aknutas/www-express-mongo-demo/src/master/app.js */

// Reading env variables (config example from https://github.com/sclorg/nodejs-ex/blob/master/server.js)
var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
  mongoURLLabel = "";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + "_SERVICE_HOST"];
    mongoPort = process.env[mongoServiceName + "_SERVICE_PORT"];
    mongoDatabase = process.env[mongoServiceName + "_DATABASE"];
    mongoPassword = process.env[mongoServiceName + "_PASSWORD"];
    mongoUser = process.env[mongoServiceName + "_USER"];

    // If using env vars from secret from service binding
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = "mongodb://";
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ":" + mongoPassword + "@";
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ":" + mongoPort + "/" + mongoDatabase;
    mongoURL += mongoHost + ":" + mongoPort + "/" + mongoDatabase;
  }
}

/* CONNECTING TO DATABASE
 Gives an error: undefined mongoURL */
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});
mongoose.Promise = Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

/* SET THE VIEWS ENGINE: Using ejs but naming files with .html */
app.set("views", path.join(__dirname, "../views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
/* Now we can save views as .html instead of .ejs */

/* TAKE OTHER LIBRARIES INTO USE: */
/* For fill-out forms: */
app.use(express.urlencoded({ extended: false }));
/* Allow showing flash messages to the user: */
app.use(flash());
/* Allow user login sessions: */
if (process.env.SESSION_SECRET == null) {
  console.log("Session secret failed");
}
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
/* Set up passport libraries for the user authentication and user sessions: */
app.use(passport.initialize());
app.use(passport.session());
/* Override form methods to make e.g. deleting posts possible: */
app.use(methodOverride("_method"));

/* SET THE FIRST PAGE THE USER LANDS ON
Later: index.html should be welcome page unless logged in.


function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { // If the user is logged in
    return next()
  }

  res.redirect('/login') // Redirect to log in if not logged in
}

^ SEE IN THAT FUNCTION:
Login page should have an option to view public posts without logging in.
* log out page and button should be only visible to logged in users


SEE IF USER HAS ALREADY LOGGED IN BUT STILL TRIES TO LOG IN
-> Prevent the user from doing authentication on top of authentication
* sign up and log in pages should be hidden

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { // if logged in
    return res.redirect('/') // redirect to home page
  }
  next()
}

Render the blog posts from the database on the index page in an order
"from new to old (desc)": */
app.get("/", async (req, res) => {
  const blogPosts = await Post.find().sort({ timeStamp: "desc" });
  res.render("posts/index", { blogPosts: blogPosts });
});

/* USE THE POSTROUTER:
Now every blog post will use a URL with a /posts/ */
app.use("/posts", postRouter);

/* USE THE USERROUTER:
Now every user account will use a URL with a /users/ */
app.use("/users", userRouter);

/* Setting the port by reading the environment variables: 
https://github.com/sclorg/nodejs-ex/blob/master/server.js */
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";

app.set("port", port);

app.listen(port);
