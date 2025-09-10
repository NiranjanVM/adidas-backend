const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { authMiddleware } = require("../middleware/authMiddleware");

// Add product to wishlist
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    const populated = await wishlist.populate("products");
    res.status(200).json(populated.products); // return array of products
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error adding to wishlist" });
  }
});

// Get current user's wishlist
router.get("/", authMiddleware, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate("products");
    if (!wishlist) return res.status(200).json([]); // empty array if no wishlist
    res.json(wishlist.products); // return array of products
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching wishlist" });
  }
});

// Remove product from wishlist
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );
    await wishlist.save();

    const populated = await wishlist.populate("products");
    res.status(200).json(populated.products); // return array of products
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error removing from wishlist" });
  }
});

module.exports = router;
