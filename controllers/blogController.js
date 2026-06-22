const Blog = require("../models/Blog.js");
const cloudinary = require("../utils/cloudinary.js");

// ✅ Custom slugify function 
const slugify = (text = "") =>
    text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

const generateUniqueBlog = async (baseSlug, excludeId = null) => {
    let slug = baseSlug;
    let count = 1;

    while (true) {
        const query = { slug };
        if (excludeId) query._id = { $ne: excludeId };

        const existing = await Blog.findOne(query);
        if (!existing) break;

        slug = `${baseSlug}-${count}`;
        count++;
    }

    return slug;
};

const slugifyBlog = (text) => {
    return slugify(text || "")
        .substring(0, 80)
        .replace(/^-+|-+$/g, "");
};

const parseTags = (tagString) => {
    if (!tagString) return [];
    if (Array.isArray(tagString)) {
        return tagString.map((tag) => tag.trim()).filter(Boolean);
    }
    return tagString
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
};

const validateBlogData = (data, { isCreate } = {}) => {
    const errors = [];

    if (!data.title?.trim()) {
        errors.push("Title is required");
    }

    if (isCreate && !data.image?.trim()) {
        errors.push("Image is required");
    }

    const plainContent = (data.content || "").replace(/<[^>]+>/g, "").trim();
    if (!plainContent) {
        errors.push("Content is required");
    }

    return errors;
};

// GET ALL BLOGS
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ date: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Failed to fetch blogs", error: error.message });
    }
};

// GET BLOG BY ID (for edit)
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        res.status(200).json(blog);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Failed to fetch blog", error: error.message });
    }
};

// GET BLOG BY SLUG (for public page)
exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        res.status(200).json(blog);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Failed to fetch blog", error: error.message });
    }
};

// CREATE BLOG
exports.createBlog = async (req, res) => {
    try {
        const {
            title,
            image,
            content,
            excerpt,
            tags,
            category,
            metaTitle,
            metaDescription,
            status,
        } = req.body;

        // Validate
        const validationErrors = validateBlogData(req.body, { isCreate: true });
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }

        // Upload image to Cloudinary
        let imageUrl = null;
        if (image && image.startsWith("data:image")) {
            try {
                const uploadedImage = await cloudinary.uploader.upload(image, {
                    folder: "blogs",
                    quality: "auto",
                    fetch_format: "auto",
                });
                imageUrl = uploadedImage.secure_url;
            } catch (uploadError) {
                return res
                    .status(400)
                    .json({ message: "Image upload failed", error: uploadError.message });
            }
        } else if (image) {
            imageUrl = image;
        }

        if (!imageUrl) {
            return res.status(400).json({ message: "Valid image URL or data required" });
        }

        // Generate unique slug
        let slug = slugifyBlog(title) || `blog-${Date.now()}`;
        slug = await generateUniqueBlog(slug);

        // Create blog
        const newBlog = new Blog({
            title,
            slug,
            image: imageUrl,
            excerpt: excerpt || "",
            content,
            tags: parseTags(tags),
            category: category || "health",
            metaTitle: metaTitle || "",
            metaDescription: metaDescription || "",
            status: status || "draft",
        });

        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Failed to create blog", error: error.message });
    }
};

// UPDATE BLOG
exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            image,
            content,
            excerpt,
            tags,
            category,
            metaTitle,
            metaDescription,
            status,
        } = req.body;

        // Find existing blog
        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        // Validate
        const validationErrors = validateBlogData(req.body, { isCreate: false });
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }

        // Handle image upload if new image provided
        let imageUrl = blog.image;
        if (image && image.startsWith("data:image")) {
            try {
                const uploadedImage = await cloudinary.uploader.upload(image, {
                    folder: "blogs",
                    quality: "auto",
                    fetch_format: "auto",
                });
                imageUrl = uploadedImage.secure_url;
            } catch (uploadError) {
                return res
                    .status(400)
                    .json({ message: "Image upload failed", error: uploadError.message });
            }
        } else if (image && !image.startsWith("http")) {
            imageUrl = image;
        }

        // Update slug if title changed
        if (title && title !== blog.title) {
            let newSlug = slugifyBlog(title);
            newSlug = await generateUniqueBlog(newSlug, id);
            blog.slug = newSlug;
        }

        // Update fields
        if (title) blog.title = title;
        blog.image = imageUrl;
        if (content) blog.content = content;
        if (excerpt !== undefined) blog.excerpt = excerpt;
        if (tags !== undefined) blog.tags = parseTags(tags);
        if (category) blog.category = category;
        if (metaTitle !== undefined) blog.metaTitle = metaTitle;
        if (metaDescription !== undefined) blog.metaDescription = metaDescription;
        if (status) blog.status = status;

        const updatedBlog = await blog.save();
        res.status(200).json(updatedBlog);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Failed to update blog", error: error.message });
    }
};

// DELETE BLOG
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Failed to delete blog", error: error.message });
    }
};