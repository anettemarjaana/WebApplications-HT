const mongoose = require("mongoose");
const slugify = require("slugify");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
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

/* The function below is going to be ran within any update of the user */
userSchema.pre("validate", function (next) {
  if (this.name) {
    this.urlSlug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
