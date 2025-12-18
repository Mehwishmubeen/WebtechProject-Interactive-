const Product = require('../models/Product');

async function getDashboard(req, res, next) {
  try {
    const productCount = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 5 } });
    const latestProducts = await Product.find().sort({ createdAt: -1 }).limit(5);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      layout: 'layouts/admin',
      metrics: {
        productCount,
        lowStockCount
      },
      latestProducts
    });
  } catch (error) {
    next(error);
  }
}

async function getProducts(req, res, next) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render('admin/products/index', {
      title: 'Manage Products',
      layout: 'layouts/admin',
      products
    });
  } catch (error) {
    next(error);
  }
}

function getNewProductForm(req, res) {
  res.render('admin/products/new', {
    title: 'Add Product',
    layout: 'layouts/admin',
    product: {}
  });
}

async function createProduct(req, res, next) {
  try {
    await Product.create(req.body);
    res.redirect('/admin/products');
  } catch (error) {
    next(error);
  }
}

async function getEditProductForm(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).render('errors/404', {
        title: 'Product Not Found',
        layout: 'layouts/admin'
      });
    }

    res.render('admin/products/edit', {
      title: 'Edit Product',
      layout: 'layouts/admin',
      product
    });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).render('errors/404', {
        title: 'Product Not Found',
        layout: 'layouts/admin'
      });
    }

    res.redirect('/admin/products');
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).render('errors/404', {
        title: 'Product Not Found',
        layout: 'layouts/admin'
      });
    }

    res.redirect('/admin/products');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
  getProducts,
  getNewProductForm,
  createProduct,
  getEditProductForm,
  updateProduct,
  deleteProduct
};
