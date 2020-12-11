const express = require("express");
const Post = require("./../dbmodels/post"); // schema for creating new posts
const router = express.Router();

//const { sanitizeBody } = require("express-validator"); // validator for checking the objects

/* The New Post -page will be in an address ".../posts/new". */
router.get("/new", (req, res) => {
  res.render("posts/new", {
    post: new Post()
  });
});

/* Once the post is ready, the app will redirect the user to see the new post.
That view model is feed: */
router.get("/:urlSlug", async (req, res) => {
  const post = await Post.findOne({ urlSlug: req.params.urlSlug });
  if (post == null) {
    /* if the id in the address is incorrect*/
    res.redirect("/"); /* redirect to home page */
  } else {
    res.render("posts/feed", {
      post: post
    });
  }
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

  try {
    /* If there's a success: */
    /* Wait till the post is saved in database and then redirect to page /posts/id */
    post = await post.save();
    console.log("Inserted 1 post");
    res.redirect(`/posts/${post.urlSlug}`);
    console.log("Redirection done");
  } catch (e) {
    /* If a required information is missing */
    /* Stay on the same page*/
    console.log(e);
    res.render("posts/new", {
      post: post /* The fields will be prepopulated with the failed post. */
    });
  }
});

/* A function for deleting posts:
Because forms can only either GET or POST, we need to require method-override */
router.delete("/:id", async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

module.exports = router;
