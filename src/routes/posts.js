const express = require("express");
const Post = require("./../dbmodels/post");
const router = express.Router();

router.get("/new", (req, res) => {
  res.render("posts/new", {
    post: new Post()
  });
});

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post == null) {
    res.redirect("/");
  }
  res.render("./../views/posts/feed.html", {
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
    post = await post.save;
    res.redirect(`/posts/${post.id}`);
  } catch (e) {
    res.render("posts/new", {
      post: post
    });
  }
});

module.exports = router;
