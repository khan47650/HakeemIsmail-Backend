const Article = require("../models/Article");

exports.createArticle = async (req, res) => {
    try {
        const article = await Article.create(req.body);
        res.json(article);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getArticles = async (req, res) => {
    try {
        const articles = await Article.find().sort({ createdAt: -1 });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument:"after",
        });

        res.json(article);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.json({ message: "Article deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};