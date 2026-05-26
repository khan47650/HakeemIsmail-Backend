const mongoose = require("mongoose");

const shortSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    youtubeUrl: {
      type: String,
      default: "",
    },
    facebookUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Short", shortSchema);