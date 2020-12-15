const express = require("express");
const Post = require("./../dbmodels/post"); // schema for creating new posts
const User = require("./../dbmodels/user"); // schema that contains users in the db
const router = express.Router();

/* Checking if the user is authenticated to see certain pages based on 
if there is an ongoing session or not: */
const redirectIfAuthenticated = require("./../js/redirectIfAuthenticated");
const redirectIfNotAuthenticated = require("./../js/redirectIfNotAuthenticated");

/* Render the blog posts from the database on the index page in an order
"from new to old (desc)". The user is not seeing their own posts on this index page.
*/
router.get("/index", async (req, res) => {
  /* Any user is allowed to view the posts that are marked as visibleTo: all */
  let permissions = ["all"];
  /* Preparing the arrays: the permittingUsers will contain the users that allow this user
  to view their blog.
  The blogPosts will finally contain their posts. */
  let permittingUsers = [];
  let blogPosts = [];

  /* push appends an element to the end of the array. */
  if (req.isAuthenticated()) {
    permissions.push("registered");

    /* Find those users that have visibility type "specified" */
    const specified = await User.find({ visibleTo: "specified" });
    /* Find those that include this user in their allowed blog readers */
    for (var i = 0; i < specified.length; i++) {
      if (specified[i].includes(req.user.username)) {
        permittingUsers.push(specified[i]);
      }
    }
  }

  /* Loop through permission by permission to get the final list of the users that
  allow this user to see their posts */
  for (var i = 0; i < permissions.length; i++) {
    permittingUsers.push(await User.find({ visibleTo: permissions[i] }));
  }

  /* Find all the blog posts made by the allowing authors */
  for (var j = 0; j < permittingUsers.length; j++) {
    blogPosts.push(await Post.find({ author: permittingUsers[j] }));
  }

  /* Sort the available blog posts from the newest to oldest and render them. */
  blogPosts = blogPosts.sort({ timeStamp: "desc" });
  /* ^ That gives an error:
  TypeError: The comparison function must be either a function or undefined */
  res.render("posts/index", {
    blogPosts: blogPosts
  });
});

/* The New Post -page will be in an address ".../posts/new".
This function renders the fields and prepares a new database object. 
Only a logged in user is allowed to create a post. */
router.get("/new", redirectIfNotAuthenticated, (req, res) => {
  res.render("posts/new", {
    post: new Post()
  });
});

/* The Edit Post -page will be in an address ".../posts/edit". 
This function renders the edit view and prefills the form fields with
the selected post. 
Only a logged in user is allowed to edit a post. */
router.get("/edit/:id", redirectIfNotAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render("posts/edit", {
    post: post
  });
});

/* Hitting the save button on posts/new will call this function.
It creates a new post and redirects to savePost function. 
Only a logged in user is allowed to create a post. */
router.post(
  "/",
  redirectIfNotAuthenticated,
  async (req, res, next) => {
    req.post = new Post();
    next();
  },
  savePost("new")
);

/* A function for editing posts.
Only a logged in user is allowed to edit a post.  */
router.put(
  "/:id",
  redirectIfNotAuthenticated,
  async (req, res, next) => {
    req.post = await Post.findById(req.params.id);
    next();
  },
  savePost("edit")
);

/* A function for deleting posts:
Because forms can only either GET or POST, we need to require method-override.
Only a logged in user is allowed to delete a post. */
router.delete("/:id", redirectIfNotAuthenticated, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

/* This function is called when creating a new or editing an existing
post. It takes in a path which is either new or edit. That will be
used in the redirection in an error case. */
function savePost(path) {
  return async (req, res) => {
    /* Fetch the information of the post from the _formfields and the session,
    and save them in database */
    let post = req.post;
    post.author = req.user.username;
    post.authorSlug = req.user.urlSlug;
    post.content = req.body.content;
    console.log(post);

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
That view model is show and it is double protected as follows:
Only authenticated users can see this view + only the author can see this view,
because it includes the "Edit" and "Delete" methods of the posts. */
router.get("/:urlSlug", redirectIfNotAuthenticated, async (req, res) => {
  const post = await Post.findOne({ urlSlug: req.params.urlSlug });
  if (post.authorSlug === req.user.urlSlug) {
    if (post == null) {
      /* if the slug in the address is incorrect*/
      res.redirect("/"); /* redirect to home page */
    } else {
      res.render("posts/show", {
        post: post
      });
    }
  } else {
    res.redirect("/posts/index");
  }
});

module.exports = router;
