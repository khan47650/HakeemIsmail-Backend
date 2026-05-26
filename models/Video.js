const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        duration: String,
        thumbnail: String, 

        youtubeUrl: String,
        facebookUrl: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);