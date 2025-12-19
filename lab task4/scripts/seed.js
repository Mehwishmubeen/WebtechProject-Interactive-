require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/webtech_admin';
const FORCE = process.argv.includes('--force');

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    const products = [
      {
        name: 'Notebook A5',
        description: 'Ruled A5 notebook, 120 pages',
        price: 149,
        category: 'Stationery',
        stock: 25,
        imageUrl: ''
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic 2.4GHz wireless mouse',
        price: 799,
        category: 'Electronics',
        stock: 40,
        imageUrl: ''
      },
      {
        name: 'Coffee Mug',
        description: 'Ceramic mug 350ml',
        price: 249,
        category: 'Kitchen',
        stock: 60,
        imageUrl: ''
      }
    ];

    if (FORCE) {
      await Product.deleteMany({});
      console.log('Cleared existing products (force mode)');
    }

    // Upsert by product name so seeds appear even if some docs exist
    await Product.bulkWrite(
      products.map((p) => ({
        updateOne: {
          filter: { name: p.name },
          update: { $setOnInsert: p },
          upsert: true
        }
      }))
    );

    const total = await Product.countDocuments();
    console.log(`Seed complete. Products in DB: ${total}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  }
}

run();
