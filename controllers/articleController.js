const Article = require("../models/Article");

const SLUG_REGEX = /^[a-z0-9-]+$/;

const slugify = (text = "") =>
    text.toString().toLowerCase().trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

const generateUniqueSlug = async (title, slugInput, excludeId) => {
    let base = slugify(slugInput || title);
    if (!base) base = "article"; // Urdu title se latin slug nahi banta

    let slug = base;
    let counter = 1;

    while (true) {
        const query = { slug };
        if (excludeId) query._id = { $ne: excludeId };
        const existing = await Article.findOne(query);
        if (!existing) break;
        slug = `${base}-${counter}`;
        counter++;
    }
    return slug;
};

const parseTags = (tags) => {
    if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean);
    if (typeof tags === "string") return tags.split(",").map((t) => t.trim()).filter(Boolean);
    return [];
};

const validateArticleData = (data) => {
    const errors = {};
    if (!data.title || !data.title.trim()) errors.title = "Title is required";

    const plain = (data.content || "").replace(/<[^>]+>/g, "").trim();
    if (!plain) errors.content = "Content is required";

    if (data.slug && !SLUG_REGEX.test(slugify(data.slug)) && !SLUG_REGEX.test(data.slug)) {
        errors.slug = "Slug can only contain lowercase letters, numbers and hyphens";
    }
    if (data.status && !["draft", "published"].includes(data.status)) errors.status = "Invalid status";
    return errors;
};

// CREATE
exports.createArticle = async (req, res) => {
    try {
        const errors = validateArticleData(req.body);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: "Validation failed", errors });
        }

        const {
            title, slug, excerpt, content,
            tags, category, metaTitle, metaDescription, status, date,
        } = req.body;

        const finalSlug = await generateUniqueSlug(title, slug);

        const article = await Article.create({
            title,
            slug: finalSlug,
            excerpt,
            content,
            tags: parseTags(tags),
            category,
            metaTitle,
            metaDescription,
            status: status || "draft",
            date: date || Date.now(),
        });

        res.json(article);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET ALL
exports.getArticles = async (req, res) => {
    try {
        const articles = await Article.find().sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET ONE (edit)
exports.getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "Article not found" });
        res.json(article);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE
exports.updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };

        const errors = validateArticleData(data);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: "Validation failed", errors });
        }

        if (data.tags !== undefined) data.tags = parseTags(data.tags);
        if (data.title || data.slug) data.slug = await generateUniqueSlug(data.title, data.slug, id);

        const article = await Article.findByIdAndUpdate(id, data, { returnDocument: "after" });
        res.json(article);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE
exports.deleteArticle = async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.json({ message: "Article deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};