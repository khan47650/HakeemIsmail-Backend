const express = require("express");
const router = express.Router();

const {
    createArticle,
    getArticles,
    updateArticle,
    deleteArticle,
} = require("../controllers/articleController");

router.post("/", createArticle);
router.get("/", getArticles);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);

module.exports = router;