const mongoose = require("mongoose");

// Product schema - defines what each product looks like
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

// Add indexes to make filtering by category and price faster
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model("Product", productSchema);
