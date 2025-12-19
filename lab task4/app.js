const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

const adminRouter = require('./routes/admin');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('store/home', { title: 'Welcome to the Store' });
});

app.use('/admin', adminRouter);

// Lightweight DB health check: returns connection state and counts
app.get('/health/db', async (req, res) => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const state = mongoose.connection.readyState;
  let productCount = null;
  try {
    const Product = require('./models/Product');
    productCount = await Product.countDocuments();
  } catch (e) {
    // ignore count errors, still return connection state
  }
  res.json({
    status: stateMap[state] || String(state),
    productCount
  });
});

// Sample products payload to verify field alignment with existing data
app.get('/health/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const docs = await Product.find().limit(5).lean();
    res.json({ count: docs.length, sample: docs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use((req, res) => {
  res.status(404).render('errors/404', {
    title: 'Page Not Found',
    layout: 'layouts/main'
  });
});

app.use((err, req, res, next) => {
  // Basic error fallback for unexpected failures
  console.error(err);
  res.status(500).render('errors/500', {
    title: 'Server Error',
    layout: 'layouts/main',
    message: 'Something went wrong. Please try again later.'
  });
});

module.exports = app;
