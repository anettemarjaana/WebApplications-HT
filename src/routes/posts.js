const express = require("express");
const Post = require("./../dbmodels/post");
const router = express.Router();

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
    post = await post.save;
    res.redirect(`/posts/${post.id}`);
  } catch (e) {
    /* If a required information is missing */
    /* Stay on the same page*/
    res.render("posts/new", {
      post: post /* The fields will be prepopulated with the failed post. */
    });
  }
});

module.exports = router;
