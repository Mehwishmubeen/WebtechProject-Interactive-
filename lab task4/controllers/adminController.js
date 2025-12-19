const Product = require('../models/Product');

function normalizeProduct(doc) {
  const p = doc?.toObject ? doc.toObject() : doc || {};
  const name = p.name ?? p.title ?? '';
  const category = p.category ?? p.type ?? p.categoryName ?? 'General';
  const price = Number(p.price ?? p.amount ?? p.cost ?? 0);
  const stock = Number(p.stock ?? p.qty ?? p.quantity ?? 0);
  const imageUrl = p.imageUrl ?? p.image ?? p.image_url ?? '';
  const createdAt = p.createdAt ?? p.created_at ?? new Date();
  const updatedAt = p.updatedAt ?? p.updated_at ?? createdAt;
  return {
    _id: p._id,
    name,
    category,
    price,
    stock,
    imageUrl,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt)
  };
}

async function getDashboard(req, res, next) {
  try {
    const productCount = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 5 } });
    const latestProductsRaw = await Product.find().sort({ createdAt: -1 }).limit(5);
    const latestProducts = latestProductsRaw.map(normalizeProduct);

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
    const productsRaw = await Product.find().sort({ createdAt: -1 });
    const products = productsRaw.map(normalizeProduct);
    const { success } = req.query;
    let flash = null;
    if (success === 'created') {
      flash = { type: 'success', message: 'Product created successfully.' };
    } else if (success === 'updated') {
      flash = { type: 'success', message: 'Product updated successfully.' };
    } else if (success === 'deleted') {
      flash = { type: 'success', message: 'Product deleted successfully.' };
    }

    res.render('admin/products/index', {
      title: 'Manage Products',
      layout: 'layouts/admin',
      products,
      flash
    });
  } catch (error) {
    next(error);
  }
}

function getNewProductForm(req, res) {
  res.render('admin/products/new', {
    title: 'Add Product',
    layout: 'layouts/admin',
    product: {},
    errors: []
  });
}

async function createProduct(req, res, next) {
  const { name, category, price, stock, imageUrl, description } = req.body;
  const productData = { name, category, price, stock, imageUrl, description };

  try {
    console.log('[admin] createProduct body:', req.body);
    await Product.create(productData);
    res.redirect('/admin/products?success=created');
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      res.status(422).render('admin/products/new', {
        title: 'Add Product',
        layout: 'layouts/admin',
        product: productData,
        errors
      });
      return;
    }
    next(error);
  }
}

async function getEditProductForm(req, res, next) {
  try {
    const found = await Product.findById(req.params.id);
    const product = found ? normalizeProduct(found) : null;

    if (!product) {
      return res.status(404).render('errors/404', {
        title: 'Product Not Found',
        layout: 'layouts/admin'
      });
    }

    res.render('admin/products/edit', {
      title: 'Edit Product',
      layout: 'layouts/admin',
      product,
      errors: []
    });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  const { name, category, price, stock, imageUrl, description } = req.body;
  const productData = { name, category, price, stock, imageUrl, description };

  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updated) {
      return res.status(404).render('errors/404', {
        title: 'Product Not Found',
        layout: 'layouts/admin'
      });
    }

    res.redirect('/admin/products');
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      res.status(422).render('admin/products/edit', {
        title: 'Edit Product',
        layout: 'layouts/admin',
        product: { ...productData, _id: req.params.id },
        errors
      });
      return;
    }
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

    res.redirect('/admin/products?success=deleted');
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
