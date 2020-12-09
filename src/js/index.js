const express = require("express");
const app = express();

var db = require("./db");

const postRouter = require("../routes/posts");

/* GET THE VIEW FROM views/index.html */
var path = require("path");
app.set("views", path.join(__dirname, "../views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
/* Now we can save views as .html instead of .ejs */

/* Connect to database */
db.connect(db.urlbuilder(), function (err) {
  if (err) {
    /* if the mongoURL is undefined */
    console.log("Unable to connect to Mongo.");
    process.exit(1); /* Server connection fails */
  }
});

/* Grant an access to the information in the _formfields */
app.use(express.urlencoded({ extended: false }));

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
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";

app.set("port", port);

app.listen(8080);
