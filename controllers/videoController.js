const Video = require("../models/Video");
const cloudinary = require("../utils/cloudinary");

// CREATE
exports.createVideo = async (req, res) => {
    try {
        const { title, description, duration, youtubeUrl, facebookUrl, thumbnail } = req.body;

        if (!youtubeUrl && !facebookUrl) {
            return res.status(400).json({ message: "At least one video URL required" });
        }

        let uploadedImage = "";

        if (thumbnail) {
            const uploadRes = await cloudinary.uploader.upload(thumbnail, {
                folder: "videos",
            });

            uploadedImage = uploadRes.secure_url;
        }

        const video = await Video.create({
            title,
            description,
            duration,
            thumbnail: uploadedImage,
            youtubeUrl,
            facebookUrl,
        });

        res.json(video);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ALL
exports.getVideos = async (req, res) => {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
};

// UPDATE
exports.updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };

        if (!data.youtubeUrl && !data.facebookUrl) {
            return res.status(400).json({ message: "At least one URL required" });
        }

        if (data.thumbnail && data.thumbnail.startsWith("data:image")) {
            const uploadRes = await cloudinary.uploader.upload(data.thumbnail, {
                folder: "videos",
            });

            data.thumbnail = uploadRes.secure_url;
        } else {
            delete data.thumbnail;
        }

        const updated = await Video.findByIdAndUpdate(id, data, {
            returnDocument: "after",
        });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE
exports.deleteVideo = async (req, res) => {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
};