const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Blog title is required"],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
        },
        image: {
            type: String,
            required: [true, "Blog image is required"],
        },
        excerpt: {
            type: String,
            default: "",
        },
        content: {
            type: String,
            required: [true, "Blog content is required"],
        },
        tags: [String],
        category: {
            type: String,
            default: "health",
        },
        metaTitle: {
            type: String,
            default: "",
        },
        metaDescription: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);