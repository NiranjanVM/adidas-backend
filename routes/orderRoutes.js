const express = require("express");
const Order = require("../models/Orders");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Create new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ message: "No items in order" });

    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
    });

    await order.save();
    const populatedOrder = await order.populate("items.product");
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating order" });
  }
});

// Get orders for logged-in user
router.get("/myorders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("items.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Get all orders (admin)
router.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate("user").populate("items.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all orders" });
  }
});

// Update order status (admin)
router.put("/status/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status || order.status;
    await order.save();
    const populatedOrder = await order.populate("items.product");
    res.json(populatedOrder);
  } catch (err) {
    res.status(500).json({ message: "Error updating order status" });
  }
});

// Delete order (user)
// Delete order (user)
// Delete order (user or admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Allow if user owns the order OR is admin
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await order.deleteOne(); // <-- fixed
    res.json({ message: "Order canceled!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});







module.exports = router;
