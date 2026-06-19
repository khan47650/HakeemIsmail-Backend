const mongoose = require("mongoose");

const shortSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },

    description: String,
    tags: [String],
    category: String,

    duration: { type: String, default: "" },
    thumbnail: { type: String, default: "" },

    youtubeUrl: { type: String, default: "" },
    facebookUrl: { type: String, default: "" },

    metaTitle: String,
    metaDescription: String,

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Short", shortSchema);