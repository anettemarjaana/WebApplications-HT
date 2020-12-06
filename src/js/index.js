const express = require("express");
const mongoose = require("mongoose");
const app = express();

mongoose.connect("mongodb://localhost/rapper", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const postRouter = require("../routes/posts");

/* GET THE VIEW FROM views/index.html */
var path = require("path");
app.set("views", path.join(__dirname, "../views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
/* Now we can save views as .html instead of .ejs */

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

app.listen(8080);
