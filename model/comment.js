const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  tourId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  numStar: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("Comment", commentSchema);
