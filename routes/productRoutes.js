const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const Product = require("../models/Product"); // 👈 need this for search

const router = express.Router();

// Public routes
router.get("/", getProducts);

// 🔍 Search products
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q || "";
    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    }).select("name image price"); // only return minimal fields for search
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error searching products" });
  }
});

router.get("/:id", getProductById);

// Admin routes
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
