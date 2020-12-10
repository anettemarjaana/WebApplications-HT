const express = require("express");
const app = express();
var mongoose = require("mongoose");
var Promise = require("bluebird");

const postRouter = require("../routes/posts");

/* GET THE VIEW FROM views/index.html */
var path = require("path");
app.set("views", path.join(__dirname, "../views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
/* Now we can save views as .html instead of .ejs */

/* Grant an access to the information in the _formfields */
app.use(express.urlencoded({ extended: false }));

/* Building the database connection like in express-mongo demo:
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
console.log("Mongo URL: " + mongoURL);
// Connecting to DB
mongoose.connect(mongoURL);
mongoose.Promise = Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Create route
app.get("/", (req, res) => {
  const blogPosts = [
    {
      title: "Test Post",
      timeStamp: new Date().toLocaleDateString(),
      content: "This is my first blog post!"
    },
    {
      title: "Test Post 2",
      timeStamp: new Date().toLocaleDateString(),
      content: "This is my very second blog post!"
    }
  ];
  res.render("posts/index", { blogPosts: blogPosts });
});

/* USE THE POSTROUTER:
Now every blog post will use a URL with a /posts/ */
app.use("/posts", postRouter);

/* Setting the port by reading the environment variables: 
https://github.com/sclorg/nodejs-ex/blob/master/server.js */
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.set("port", port);

app.listen(8080);
