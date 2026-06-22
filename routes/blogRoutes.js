const express = require("express");
const {
    getAllBlogs,
    getBlogById,
    getBlogBySlug,
    createBlog,
    updateBlog,
    deleteBlog,
} = require("../controllers/blogController.js");

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.get("/slug/:slug", getBlogBySlug);
router.post("/", createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

module.exports = router;