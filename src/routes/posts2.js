const express = require("express");
const Post = require("./../dbmodels/post"); // schema for creating new posts
const router = express.Router();

//const { sanitizeBody } = require("express-validator"); // validator for checking the objects

// Get the db instance
var db = require("../js/db");

/* The New Post -page will be in an address ".../posts/new". */
router.get("/new", (req, res) => {
  res.render("posts/new", {
    post: new Post()
  });
});

/* Once the post is ready, the app will redirect the user to a see the page */
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post == null) {
    /* if the id in the address is incorrect*/
    res.redirect("/"); /* redirect to home page */
  }
  res.render("posts/feed", {
    post: post
  });
});

/* Get the collection of posts from the database: */
router.get("/", function (req, res, next) {
  db.get()
    .collection("posts")
    .find()
    .limit(50)
    .toArray()
    .then(function (data) {
      console.log(data);
      res.render("posts", { title: "List of Opinions:", post_list: data });
    })
    .catch((error) => {
      console.log("Rendering the posts from the database failed: " + error);
    });
});

/* Hitting the save button on posts/new will call this function.
The function should save the post in the database. */
router.post("/", async (req, res) => {
  let post = new Post({
    /* Fetch the information of the post from the _formfields
    and save them in database */
    title: req.body.title,
    content: req.body.content
  });
  console.log("We got title: " + post.title);
  console.log("and content: " + post.content);

  /* If there's a success: */
  /* Wait till the post is saved in database and then redirect to page /posts/id */
  db.get()
    .collection("posts")
    .insertOne(post)
    .then(function () {
      console.log("Inserted 1 post");
      res.redirect(`/posts/${post.id}`);
    })
    .catch((error) => {
      console.log(error);
      /* If a required information is missing */
      /* Stay on the same page*/
      res.render("posts/new", {
        post: post /* The fields will be prepopulated with the failed post. */
      });
    });
});

module.exports = router;
