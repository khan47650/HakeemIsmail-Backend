const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true }, // rich text (Urdu HTML)
    tags: [String],
    category: String,
    metaTitle: String,
    metaDescription: String,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);