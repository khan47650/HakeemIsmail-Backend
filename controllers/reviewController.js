const Review = require("../models/Review");
const Product = require("../models/Products");
const cloudinary = require("../utils/cloudinary");

// 1. Get All Reviews (Admin Panel ke liye)
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate({ path: "productId", model: Product, select: "name image" })
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error("Get All Reviews Error:", error);
        res.status(500).json({ message: "Failed to fetch reviews" });
    }
};

// 2. Get Single Product Reviews (Product Detail Page ke liye)
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).sort({
            createdAt: -1,
        });

        res.json(reviews);
    } catch (error) {
        console.error("Get Product Reviews Error:", error);
        res.status(500).json({ message: "Failed to fetch product reviews" });
    }
};

// 3. Add New Review Screenshot (Admin)
exports.addReview = async (req, res) => {
    try {
        const { productId, image } = req.body;

        if (!productId || !image) {
            return res.status(400).json({ message: "Product and screenshot image are required" });
        }

        const uploadResult = await cloudinary.uploader.upload(image, {
            folder: "reviews",
        });

        const newReview = await Review.create({
            productId,
            image: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
        });

        const populatedReview = await Review.findById(newReview._id).populate({
            path: "productId",
            model: Product,
            select: "name image",
        });

        res.status(201).json(populatedReview);
    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ message: "Failed to add review" });
    }
};

// 4. Edit / Update Review (Admin)
exports.updateReview = async (req, res) => {
    try {
        const { productId, image } = req.body;
        const existingReview = await Review.findById(req.params.id);

        if (!existingReview) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (productId) {
            existingReview.productId = productId;
        }

        if (image && image !== existingReview.image) {
            if (existingReview.imagePublicId) {
                await cloudinary.uploader.destroy(existingReview.imagePublicId);
            }

            const uploadResult = await cloudinary.uploader.upload(image, {
                folder: "reviews",
            });

            existingReview.image = uploadResult.secure_url;
            existingReview.imagePublicId = uploadResult.public_id;
        }

        await existingReview.save();

        const updatedReview = await Review.findById(existingReview._id).populate({
            path: "productId",
            model: Product,
            select: "name image",
        });

        res.json(updatedReview);
    } catch (error) {
        console.error("Update Review Error:", error);
        res.status(500).json({ message: "Failed to update review" });
    }
};

// 5. Delete Review (Admin)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.imagePublicId) {
            await cloudinary.uploader.destroy(review.imagePublicId);
        }

        await Review.findByIdAndDelete(req.params.id);

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Delete Review Error:", error);
        res.status(500).json({ message: "Failed to delete review" });
    }
};