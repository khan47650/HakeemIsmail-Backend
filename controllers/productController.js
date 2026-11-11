const Product = require("../models/Products");
const cloudinary = require("../utils/cloudinary");

const SLUG_REGEX = /^[a-z0-9-]+$/;

const slugify = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const generateUniqueSlug = async (name, slugInput, excludeId) => {
  let base = slugify(slugInput || name);
  if (!base) base = "product";

  let slug = base;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await Product.findOne(query);
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

const validateProductData = (data, { isCreate } = {}) => {
  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = "Name is required";
  }

  if (
    data.price === undefined ||
    data.price === null ||
    data.price === "" ||
    isNaN(Number(data.price))
  ) {
    errors.price = "Valid price is required";
  } else if (Number(data.price) < 0) {
    errors.price = "Price cannot be negative";
  }

  const plainDesc = (data.description || "").replace(/<[^>]+>/g, "").trim();
  if (!plainDesc) {
    errors.description = "Description is required";
  }

  if (isCreate && !data.image) {
    errors.image = "Product image is required";
  }

  if (
    data.slug &&
    !SLUG_REGEX.test(slugify(data.slug)) &&
    !SLUG_REGEX.test(data.slug)
  ) {
    errors.slug = "Slug can only contain lowercase letters, numbers and hyphens";
  }

  if (data.status && !["draft", "published"].includes(data.status)) {
    errors.status = "Invalid status";
  }

  return errors;
};

// GET ALL
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

// GET ONE (for edit)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

// CREATE
exports.createProduct = async (req, res) => {
  try {
    const {
      image,
      name,
      price,
      description,
      isEnglishDescription,
      category,
      slug,
      tags,
      metaTitle,
      metaDescription,
      status,
    } = req.body;

    const errors = validateProductData(req.body, { isCreate: true });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "products",
    });

    const finalSlug = await generateUniqueSlug(name, slug);

    const product = await Product.create({
      image: uploadedImage.secure_url,
      name,
      slug: finalSlug,
      price,
      description,
      isEnglishDescription: isEnglishDescription || false, 
      tags: parseTags(tags),
      category: category === "popular" ? "popular" : "nonpopular",
      metaTitle,
      metaDescription,
      status: status || "draft",
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
};

// UPDATE
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Product.findById(id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    const errors = validateProductData(req.body, { isCreate: false });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const {
      image,
      name,
      price,
      description,
      isEnglishDescription,
      category,
      slug,
      tags,
      metaTitle,
      metaDescription,
      status,
    } = req.body;

    let imageUrl = existing.image;
    if (image && image.startsWith("data:image")) {
      const uploaded = await cloudinary.uploader.upload(image, { folder: "products" });
      imageUrl = uploaded.secure_url;
    }

    existing.image = imageUrl;
    existing.name = name;
    existing.price = price;
    existing.description = description;
    existing.category = category === "popular" ? "popular" : "nonpopular";

    if (isEnglishDescription !== undefined) {
      existing.isEnglishDescription = isEnglishDescription;
    }

    if (tags !== undefined) existing.tags = parseTags(tags);
    if (metaTitle !== undefined) existing.metaTitle = metaTitle;
    if (metaDescription !== undefined) existing.metaDescription = metaDescription;
    if (status) existing.status = status;
    if (name || slug) existing.slug = await generateUniqueSlug(name, slug, id);

    await existing.save();
    res.status(200).json(existing);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

// DELETE
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};