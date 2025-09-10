const express = require("express");
const Bag = require("../models/Bag");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/bag/add
 * @desc    Add product to bag (or return existing if already added)
 * @access  Private
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let bagItem = await Bag.findOne({ user: req.user.id, product: productId }).populate("product");

    if (bagItem) {
      // Already in bag → return existing
      return res.status(200).json(bagItem);
    }

    // Otherwise, create new bag item
    bagItem = new Bag({
      user: req.user.id,
      product: productId,
      quantity: quantity || 1,
    });

    await bagItem.save();
    await bagItem.populate("product");

    res.json(bagItem);
  } catch (err) {
    res.status(500).json({ message: "Error adding to bag" });
  }
});

/**
 * @route   GET /api/bag
 * @desc    Get user bag
 * @access  Private
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const bag = await Bag.find({ user: req.user.id }).populate("product");
    res.json(bag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/bag/update/:id
 * @desc    Update quantity of a bag item
 * @access  Private
 */
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;

    // ✅ Find by bag item _id
    const bagItem = await Bag.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("product");

    if (!bagItem) return res.status(404).json({ message: "Item not found" });

    bagItem.quantity = quantity;
    await bagItem.save();

    res.json(bagItem); // return updated item with populated product
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/bag/remove/:id
 * @desc    Remove item from bag
 * @access  Private
 */
router.delete("/remove/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Bag.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Removed from bag" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/bag/clear
 * @desc    Clear all items from user's bag
 * @access  Private
 */
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    await Bag.deleteMany({ user: req.user.id });
    res.json({ message: "Bag cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
