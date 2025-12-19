const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');

const router = express.Router();

function ensureCart(req) {
  if (!req.session.cart) {
    req.session.cart = { items: [], totalAmount: 0 };
  }
  return req.session.cart;
}

function recalcCart(cart) {
  let total = 0;
  cart.items.forEach((it) => {
    total += Number(it.price) * Number(it.quantity);
  });
  cart.totalAmount = Number(total.toFixed(2));
}

// Minimal endpoint to add items to cart for testing.
router.post('/cart/add', async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Math.max(1, Number(quantity || 1));
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const cart = ensureCart(req);
    const existing = cart.items.find((it) => String(it.product) === String(product._id));
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        price: Number(product.price),
        quantity: qty
      });
    }
    recalcCart(cart);

    res.json({ message: 'Added to cart', cart });
  } catch (err) {
    next(err);
  }
});

// Checkout page: shows cart and form
router.get('/checkout', (req, res) => {
  const cart = ensureCart(req);
  res.render('store/checkout', {
    title: 'Checkout',
    layout: 'layouts/main',
    cart
  });
});

// Create order and clear cart
router.post('/checkout', async (req, res, next) => {
  try {
    const cart = ensureCart(req);
    const { customerName, email } = req.body;

    if (!cart.items.length) {
      return res.status(400).render('store/checkout', {
        title: 'Checkout',
        layout: 'layouts/main',
        cart,
        error: 'Your cart is empty.'
      });
    }

    if (!customerName || !email) {
      return res.status(422).render('store/checkout', {
        title: 'Checkout',
        layout: 'layouts/main',
        cart,
        error: 'Please provide your name and email.'
      });
    }

    const orderDoc = await Order.create({
      customerName,
      email,
      items: cart.items.map((it) => ({
        product: it.product,
        name: it.name,
        price: it.price,
        quantity: it.quantity
      })),
      totalAmount: cart.totalAmount,
      status: 'Pending'
    });

    // Clear cart session
    req.session.cart = { items: [], totalAmount: 0 };

    res.redirect(`/order/confirmation/${orderDoc._id}`);
  } catch (err) {
    next(err);
  }
});

// Order confirmation page
router.get('/order/confirmation/:id', async (req, res, next) => {
  try {
    const orderId = req.params.id;
    res.render('store/order-confirmation', {
      title: 'Order Confirmation',
      layout: 'layouts/main',
      orderId
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
