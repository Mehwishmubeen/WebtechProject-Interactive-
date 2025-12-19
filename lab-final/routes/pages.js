const express = require("express");
const Product = require("../models/products");
const Order = require("../models/order");

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

// Helper to compute totals
function calcTotals(items) {
  let total = 0;
  (items || []).forEach((it) => {
    total += Number(it.price || 0) * Number(it.quantity || 0);
  });
  return Number(total.toFixed(2));
}

// Minimal cart add for testing (session-backed)
router.post("/cart/add", async (req, res, next) => {
  try {
    const { productId, quantity } = req.body || {};
    const qty = Math.max(1, Number(quantity || 1));
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    req.session.cart = req.session.cart || { items: [], totalAmount: 0 };
    const existing = req.session.cart.items.find((it) => String(it.product) === String(product._id));
    if (existing) {
      existing.quantity += qty;
    } else {
      req.session.cart.items.push({
        product: product._id,
        name: product.name,
        price: Number(product.price),
        quantity: qty
      });
    }
    req.session.cart.totalAmount = calcTotals(req.session.cart.items);
    res.json({ message: "Added to cart", cart: req.session.cart });
  } catch (err) {
    next(err);
  }
});

// Checkout submission: create order, clear cart, redirect
router.post("/checkout", async (req, res, next) => {
  try {
    const { customerName, email, items } = req.body || {};

    // Source items from body (localStorage) or session cart
    let sourceItems = Array.isArray(items) ? items : (req.session.cart?.items || []);
    if (!sourceItems.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    if (!customerName || !email) {
      return res.status(422).json({ error: "Name and email required" });
    }

    // Normalize and verify products exist
    const normalized = [];
    for (const it of sourceItems) {
      const pid = it.id || it.product; // client may send id
      const quantity = Math.max(1, Number(it.quantity || 1));
      const product = await Product.findById(pid);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${pid}` });
      }
      normalized.push({
        product: product._id,
        name: product.name,
        price: Number(product.price),
        quantity
      });
    }
    const totalAmount = calcTotals(normalized);

    const orderDoc = await Order.create({
      customerName,
      email,
      items: normalized,
      totalAmount,
      status: "Pending"
    });

    // Clear session cart
    req.session.cart = { items: [], totalAmount: 0 };

    // Respond JSON so client can redirect
    res.json({ ok: true, orderId: String(orderDoc._id) });
  } catch (err) {
    next(err);
  }
});

// Order confirmation page
router.get("/order/confirmation/:id", (req, res) => {
  res.render("order-confirmation", { orderId: req.params.id });
});

module.exports = router;
