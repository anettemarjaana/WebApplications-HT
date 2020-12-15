const mongoose = require("mongoose");
const slugify = require("slugify");

const postSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  authorSlug: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timeStamp: {
    type: Date,
    default: Date.now
  },
  urlSlug: {
    type: String,
    required: true,
    unique: true
  }
});

/* The function below is going to be ran within any update of the post. It's
forming a url slug for the post based on the content of it.
If the content is longer than 25 characters, the slug will be a shortened
version of the content. */
postSchema.pre("validate", function (next) {
  let slug = "";
  if (this.content) {
    if (this.content.length > 25) {
      slug = this.content.substring(0, 24);
    } else {
      slug = this.content;
    }
    this.urlSlug = slugify(slug, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
