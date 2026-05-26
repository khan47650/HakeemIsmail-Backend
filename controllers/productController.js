const Product = require("../models/Products");
const cloudinary = require("../utils/cloudinary");


// GET PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};


// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const { image, name, price, description, category } = req.body;

    if (!image || !name || !price || !description) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "products",
    });

    const product = await Product.create({
      image: uploadedImage.secure_url,
      name,
      price,
      description,
      category: category === "popular" ? "popular" : "nonpopular",
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};


// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { image, name, price, description, category } = req.body;

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let imageUrl = existingProduct.image;

    if (image && image.startsWith("data:image")) {
      const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: "products",
      });

      imageUrl = uploadedImage.secure_url;
    }

    existingProduct.image = imageUrl;
    existingProduct.name = name;
    existingProduct.price = price;
    existingProduct.description = description;
    existingProduct.category =
      category === "popular" ? "popular" : "nonpopular";

    await existingProduct.save();

    res.status(200).json(existingProduct);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};


// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};