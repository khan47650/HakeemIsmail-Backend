const Short = require("../models/Short");
const cloudinary = require("../utils/cloudinary");

// CREATE
exports.createShort = async (req, res) => {
  try {
    const { title, duration, youtubeUrl, facebookUrl, thumbnail } = req.body;

    if (!youtubeUrl && !facebookUrl) {
      return res.status(400).json({
        message: "At least one short URL required",
      });
    }

    let uploadedImage = "";

    if (thumbnail) {
      const uploadRes = await cloudinary.uploader.upload(thumbnail, {
        folder: "shorts",
      });

      uploadedImage = uploadRes.secure_url;
    }

    const short = await Short.create({
      title,
      duration,
      thumbnail: uploadedImage,
      youtubeUrl,
      facebookUrl,
    });

    res.json(short);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
exports.getShorts = async (req, res) => {
  try {
    const shorts = await Short.find().sort({ createdAt: -1 });
    res.json(shorts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateShort = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (!data.youtubeUrl && !data.facebookUrl) {
      return res.status(400).json({
        message: "At least one URL required",
      });
    }

    if (data.thumbnail && data.thumbnail.startsWith("data:image")) {
      const uploadRes = await cloudinary.uploader.upload(data.thumbnail, {
        folder: "shorts",
      });

      data.thumbnail = uploadRes.secure_url;
    } else {
      delete data.thumbnail;
    }

    const updated = await Short.findByIdAndUpdate(id, data, {
      returnDocument: "after",
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteShort = async (req, res) => {
  try {
    await Short.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};