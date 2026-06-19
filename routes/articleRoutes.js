const express = require("express");
const router = express.Router();

const {
    createArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
} = require("../controllers/articleController");

router.post("/", createArticle);
router.get("/", getArticles);
router.get("/:id", getArticleById);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);

module.exports = router;