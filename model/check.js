const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const checkSchema = Schema({
  user: {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  tours: [
    {
      tour: {
        type: Object,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  infor: {
    STK: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 0,
    },
    time: {
      type: Date,
      required: true,
    },
    timeToken: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    }
  },
});

module.exports = mongoose.model('Check', checkSchema);
