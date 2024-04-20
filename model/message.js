const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = Schema({
  sender: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  content: {
    type: String,
    trim: true,
    required: true,
  },
  chat: {
    type: mongoose.Types.ObjectId,
    ref: "Chat",
  },
  time: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Message", messageSchema);
