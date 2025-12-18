const express = require('express');
const {
  getDashboard,
  getProducts,
  getNewProductForm,
  createProduct,
  getEditProductForm,
  updateProduct,
  deleteProduct
} = require('../controllers/adminController');

const router = express.Router();

router.get('/', getDashboard);

router.get('/products', getProducts);
router.get('/products/new', getNewProductForm);
router.post('/products', createProduct);

router.get('/products/:id/edit', getEditProductForm);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
