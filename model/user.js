const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    default: 1,
  },
  image: {
    type: String,
    default: "images/user2.jpg",
  },
  cart: {
    items: [
      {
        tourId: {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: "Tour",
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  resetToken: String,
  resetTokenExpiration: Date,
  address: String,
  SDT: String,
  sex: Number,
});

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
