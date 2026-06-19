const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },

    price: { type: Number, required: true },
    description: { type: String, required: true },
    tags: [String],

    category: {
      type: String,
      enum: ["popular", "nonpopular"],
      default: "nonpopular",
    },

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

module.exports = mongoose.model("Products", productSchema);