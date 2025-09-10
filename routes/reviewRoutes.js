const express = require("express");
const Review = require("../models/Review");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Add or update review (1 review per user per product)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, comment, rating } = req.body;

    let review = await Review.findOne({ product: productId, user: req.user.id });

    if (review) {
      // update existing review
      review.comment = comment;
      if (rating) review.rating = rating;
      await review.save();
      return res.json(review);
    }

    // create new review
    review = new Review({
      product: productId,
      user: req.user.id,
      comment,
      rating,
    });

    await review.save();
    review = await review.populate("user", "username");
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: "Error adding review" });
  }
});

// Get all reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("user", "username");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

module.exports = router;
