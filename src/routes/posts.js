const express = require("express");
const Post = require("./../dbmodels/post"); // schema for creating new posts
const router = express.Router();

/* Render the blog posts from the database on the index page in an order
"from new to old (desc)": */
router.get("/index", async (req, res) => {
  const blogPosts = await Post.find().sort({ timeStamp: "desc" });
  res.render("posts/index", { blogPosts: blogPosts });
});

/* The New Post -page will be in an address ".../posts/new".
This function renders the fields and prepares a new database object. */
router.get("/new", (req, res) => {
  res.render("posts/new", {
    post: new Post()
  });
});

/* The Edit Post -page will be in an address ".../posts/edit". 
This function renders the edit view and prefills the form fields with
the selected post. */
router.get("/edit/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render("posts/edit", {
    post: post
  });
});

/* Hitting the save button on posts/new will call this function.
It creates a new post and redirects to savePost function. */
router.post(
  "/",
  async (req, res, next) => {
    req.post = new Post();
    next();
  },
  savePost("new")
);

/* A function for editing posts: */
router.put(
  "/:id",
  async (req, res, next) => {
    req.post = await Post.findById(req.params.id);
    next();
  },
  savePost("edit")
);

/* A function for deleting posts:
Because forms can only either GET or POST, we need to require method-override */
router.delete("/:id", async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

/* This function is called when creating a new or editing an existing
post. It takes in a path which is either new or edit. That will be
used in the redirection in an error case. */
function savePost(path) {
  return async (req, res) => {
    /* Fetch the information of the post from the _formfields
    and save them in database */
    let post = req.post;
    post.title = req.body.title;
    post.content = req.body.content;

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
      res.render(`posts/${path}`, {
        post: post /* The fields will be prepopulated with the failed post. */
      });
    }
  };
}

/* Once the post is ready, the app will redirect the user to see the new post.
That view model is feed: */
router.get("/:urlSlug", async (req, res) => {
  const post = await Post.findOne({ urlSlug: req.params.urlSlug });
  if (post == null) {
    /* if the slug in the address is incorrect*/
    res.redirect("/"); /* redirect to home page */
  } else {
    res.render("posts/feed", {
      post: post
    });
  }
});

module.exports = router;
