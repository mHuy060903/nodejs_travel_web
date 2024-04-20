const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  tourId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Tour",
  },
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  codeToken: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
