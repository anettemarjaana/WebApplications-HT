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
  const randomValue = Math.floor(Math.random() * 3001).toString(); // for randomization of slugs
  if (this.content) {
    if (this.content.length > 40) {
      slug = this.content.substring(0, 39) + randomValue;
    } else {
      slug = this.content + randomValue;
    }
    this.urlSlug = slugify(slug, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
