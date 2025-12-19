const mongoose = require('mongoose');

// Schema for individual items in an order
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false } // Don't create separate IDs for each item
);

// Main order schema - stores customer info and order details
const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    items: { type: [orderItemSchema], validate: (v) => Array.isArray(v) && v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' }
  },
  { timestamps: true } // Automatically add createdAt and updatedAt
);

module.exports = mongoose.model('Order', orderSchema);
