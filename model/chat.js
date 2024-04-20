const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const chatSchema = Schema({
  users: [
    {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Chat", chatSchema);
