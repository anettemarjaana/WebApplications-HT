const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  _id: String,
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
  }
});

module.exports = mongoose.model("Post", postSchema);
