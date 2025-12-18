const express = require("express");
const router = express.Router();

// Home page
router.get("/", (req, res) => {
  res.render("home"); // views/home.ejs
});

// Checkout page
router.get("/checkout", (req, res) => {
  res.render("checkout"); // views/checkout.ejs
});

module.exports = router;
