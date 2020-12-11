const mongoose = require("mongoose");
const slugify = require("slugify");

const postSchema = new mongoose.Schema({
  title: {
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

/* The function below is going to be ran within any update of the post */
postSchema.pre("validate", function (next) {
  if (this.content) {
    this.urlSlug = slugify(this.content, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
