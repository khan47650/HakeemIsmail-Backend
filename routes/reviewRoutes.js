const express = require("express");
const router = express.Router();

const {
    getProductReviews,
    addReview,
    deleteReview,
} = require("../controllers/reviewController");

router.get("/product/:productId", getProductReviews);
router.post("/", addReview);
router.delete("/:id", deleteReview);

module.exports = router;