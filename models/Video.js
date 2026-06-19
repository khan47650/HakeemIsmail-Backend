const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true },

        description: String, // rich text (HTML)
        tags: [String],
        category: String,

        duration: String,
        thumbnail: String,

        youtubeUrl: String,
        facebookUrl: String,

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

module.exports = mongoose.model("Video", videoSchema);