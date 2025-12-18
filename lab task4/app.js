const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

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
