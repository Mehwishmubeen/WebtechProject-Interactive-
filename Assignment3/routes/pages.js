const express = require("express");
const Product = require("../models/products");

const router = express.Router();

// Home page
router.get("/", (req, res) => {
  res.render("home");
});

// Products listing with pagination and filters
router.get("/products", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const filter = {};

    if (req.query.category) filter.category = req.query.category;

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.render("products", {
      products,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      currentPage: page,
      query: req.query,
    });
  } catch (err) {
    next(err);
  }
});

// Checkout page
router.get("/checkout", (req, res) => {
  res.render("checkout");
});

module.exports = router;
