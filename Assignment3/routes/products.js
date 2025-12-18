const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Products listing with pagination and filtering
router.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || "";
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 1000000;

    const filter = {
      category: category ? category : { $exists: true },
      price: { $gte: minPrice, $lte: maxPrice },
    };

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.render("products", {
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.log(err);
    res.send("Error fetching products");
  }
});

module.exports = router;
