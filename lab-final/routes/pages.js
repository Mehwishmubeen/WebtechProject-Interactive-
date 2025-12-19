const express = require("express");
const Product = require("../models/products");
const Order = require("../models/order");
const checkCartNotEmpty = require("../middleware/checkCartNotEmpty");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

// Show the home page
router.get("/", (req, res) => {
  res.render("home");
});

// Show products page with filters and pagination
router.get("/products", async (req, res, next) => {
  try {
    // Get page number and limit from query, with defaults
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const filter = {};

    // Apply category filter if provided
    if (req.query.category) filter.category = req.query.category;

    // Apply price range filter if provided
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

// Show checkout page
router.get("/checkout", (req, res) => {
  res.render("checkout");
});

// Helper function to calculate total price from cart items
function calcTotals(items) {
  let total = 0;
  (items || []).forEach((it) => {
    total += Number(it.price || 0) * Number(it.quantity || 0);
  });
  return Number(total.toFixed(2));
}

// Add item to session cart (for testing purposes)
router.post("/cart/add", async (req, res, next) => {
  try {
    const { productId, quantity } = req.body || {};
    const qty = Math.max(1, Number(quantity || 1));
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Initialize cart if it doesn't exist
    req.session.cart = req.session.cart || { items: [], totalAmount: 0 };
    // If item already in cart, increase quantity
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

// Process checkout - create order and save to database
// checkCartNotEmpty middleware prevents empty cart orders
router.post("/checkout", checkCartNotEmpty, async (req, res, next) => {
  try {
    const { customerName, email, items } = req.body || {};

    // Get items from request body (client-side cart) or session
    let sourceItems = Array.isArray(items) ? items : (req.session.cart?.items || []);
    if (!customerName || !email) {
      return res.status(422).json({ error: "Name and email required" });
    }

    // Check if products still exist in database (handle deleted products)
    const normalized = [];
    const deletedProducts = [];
    
    for (const it of sourceItems) {
      const pid = it.id || it.product; // Client might send 'id' instead of 'product'
      const quantity = Math.max(1, Number(it.quantity || 1));
      const product = await Product.findById(pid);
      
      if (!product) {
        // Product was deleted - keep track to show error to user
        deletedProducts.push(it.name || pid);
        continue; // Skip this item
      }
      
      normalized.push({
        product: product._id,
        name: product.name,
        price: Number(product.price),
        quantity
      });
    }
    
    // Tell user if any products are no longer available
    if (deletedProducts.length > 0) {
      return res.status(400).json({ 
        error: `The following products are no longer available: ${deletedProducts.join(', ')}. Please remove them from your cart.`,
        deletedProducts
      });
    }
    
    // Make sure we have at least one valid item
    if (normalized.length === 0) {
      return res.status(400).json({ error: "All cart items are unavailable" });
    }
    
    const totalAmount = calcTotals(normalized);

    // Create the order in database
    const orderDoc = await Order.create({
      customerName,
      email,
      items: normalized,
      totalAmount,
      status: "Pending"
    });

    // Clear the cart after successful order
    req.session.cart = { items: [], totalAmount: 0 };

    // Send order ID back so client can show confirmation page
    res.json({ ok: true, orderId: String(orderDoc._id) });
  } catch (err) {
    next(err);
  }
});

// Show order confirmation page with order ID
router.get("/order/confirmation/:id", (req, res) => {
  res.render("order-confirmation", { orderId: req.params.id });
});

// Admin routes are in app.js to avoid routing conflicts

module.exports = router;
