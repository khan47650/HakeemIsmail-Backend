const Review = require("../models/Review");

exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).sort({
            createdAt: -1,
        });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch reviews" });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { productId, userId, userName, review } = req.body;

        if (!productId || !userId || !userName || !review) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newReview = await Review.create({
            productId,
            userId,
            userName,
            review,
        });

        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: "Failed to add review" });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { isAdmin } = req.body;

        if (!isAdmin) {
            return res.status(403).json({ message: "Only admin can delete reviews" });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete review" });
    }
};