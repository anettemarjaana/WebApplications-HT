const mongoose = require("mongoose");
const slugify = require("slugify");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
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
  },
  visibleTo: {
    type: String
  },
  permittedUsers: []
});

/* The function below is going to be ran within any update of the user */
userSchema.pre("validate", function (next) {
  if (this.username) {
    this.urlSlug = slugify(this.username, { lower: true, strict: true });
    console.log("urlSlug formed");
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
