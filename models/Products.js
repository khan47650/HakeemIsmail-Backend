const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["popular", "nonpopular"],
      default: "nonpopular",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Products", productSchema);