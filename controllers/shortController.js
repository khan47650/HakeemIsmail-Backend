const Short = require("../models/Short");
const cloudinary = require("../utils/cloudinary");

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/i;
const FACEBOOK_REGEX = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+/i;
const SLUG_REGEX = /^[a-z0-9-]+$/;

const slugify = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const generateUniqueSlug = async (title, slugInput, excludeId) => {
  let base = slugify(slugInput || title);
  if (!base) base = "short";

  let slug = base;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await Short.findOne(query);
    if (!existing) break;

    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
};

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean);
  if (typeof tags === "string") {
    return tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
};

const validateShortData = (data) => {
  const errors = {};

  if (!data.title || !data.title.trim()) {
    errors.title = "Title is required";
  }

  if (!data.youtubeUrl && !data.facebookUrl) {
    errors.youtubeUrl = "YouTube or Facebook URL is required";
  }

  if (data.youtubeUrl && !YOUTUBE_REGEX.test(data.youtubeUrl)) {
    errors.youtubeUrl = "Enter a valid YouTube URL";
  }

  if (data.facebookUrl && !FACEBOOK_REGEX.test(data.facebookUrl)) {
    errors.facebookUrl = "Enter a valid Facebook URL";
  }

  if (data.slug && !SLUG_REGEX.test(slugify(data.slug)) && !SLUG_REGEX.test(data.slug)) {
    errors.slug = "Slug can only contain lowercase letters, numbers and hyphens";
  }

  if (data.status && !["draft", "published"].includes(data.status)) {
    errors.status = "Invalid status";
  }

  return errors;
};

// CREATE
exports.createShort = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      youtubeUrl,
      facebookUrl,
      thumbnail,
      tags,
      category,
      slug,
      metaTitle,
      metaDescription,
      status,
    } = req.body;

    const errors = validateShortData(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    let uploadedImage = "";

    if (thumbnail) {
      const uploadRes = await cloudinary.uploader.upload(thumbnail, {
        folder: "shorts",
      });

      uploadedImage = uploadRes.secure_url;
    }

    const finalSlug = await generateUniqueSlug(title, slug);

    const short = await Short.create({
      title,
      slug: finalSlug,
      description,
      duration,
      thumbnail: uploadedImage,
      youtubeUrl,
      facebookUrl,
      tags: parseTags(tags),
      category,
      metaTitle,
      metaDescription,
      status: status || "draft",
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

// GET ONE (for edit)
exports.getShortById = async (req, res) => {
  try {
    const short = await Short.findById(req.params.id);
    if (!short) return res.status(404).json({ message: "Short not found" });
    res.json(short);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateShort = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    const errors = validateShortData(data);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    if (data.thumbnail && data.thumbnail.startsWith("data:image")) {
      const uploadRes = await cloudinary.uploader.upload(data.thumbnail, {
        folder: "shorts",
      });

      data.thumbnail = uploadRes.secure_url;
    } else {
      delete data.thumbnail;
    }

    if (data.tags !== undefined) {
      data.tags = parseTags(data.tags);
    }

    if (data.title || data.slug) {
      data.slug = await generateUniqueSlug(data.title, data.slug, id);
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