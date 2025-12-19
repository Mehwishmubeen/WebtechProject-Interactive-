// Script to populate the database with sample products
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/products");

// Connect to the same database the app uses
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/BeinteractiveDB";

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connection established for seeding"))
  .catch((err) => {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  });

const products = [
  {
    name: "Aurora Speaker",
    price: 149.99,
    category: "Electronics",
    image: "/download.jpeg",
    description: "Portable Bluetooth speaker with 360° sound and 18-hour battery life."
  },
  {
    name: "CozyWave Hoodie",
    price: 79.5,
    category: "Clothing",
    image: "/home_interactive_about_pic.jpg",
    description: "Soft fleece-lined hoodie designed for all-day comfort and warmth."
  },
  {
    name: "Lumen Desk Lamp",
    price: 59,
    category: "Home",
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
    description: "Adjustable LED desk lamp with wireless charging pad built in."
  },
  {
    name: "StrideFit Sneakers",
    price: 119,
    category: "Clothing",
    image: "/home_interactive_portfolio2.jpg",
    description: "Lightweight running shoes engineered for breathable support."
  },
  {
    name: "PixelVue Camera",
    price: 899,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    description: "Mirrorless camera with 4K capture and interchangeable lenses."
  },
  {
    name: "EchoPulse Earbuds",
    price: 129.99,
    category: "Electronics",
    image: "/images.jpeg",
    description: "Noise-cancelling wireless earbuds with adaptive transparency mode."
  },
  {
    name: "Saffron Leather Tote",
    price: 149,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1612810806695-30ba0a5e2b06?auto=format&fit=crop&w=800&q=80",
    description: "Handcrafted leather tote bag featuring interior laptop sleeve."
  },
  {
    name: "Atlas Travel Mug",
    price: 34.5,
    category: "Home",
    image: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=800&q=80",
    description: "Insulated stainless-steel mug that keeps drinks hot for 12 hours."
  },
  {
    name: "Nimbus Throw Blanket",
    price: 64,
    category: "Home",
    image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80",
    description: "Ultra-soft knit throw made with recycled fibers."
  },
  {
    name: "Pulse Fitness Band",
    price: 89.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80",
    description: "Water-resistant activity tracker with heart-rate monitoring and GPS sync."
  },
  {
    name: "Summit Hiking Pack",
    price: 189,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    description: "40L technical backpack featuring ventilated straps and weatherproof shell."
  },
  {
    name: "Velvet Bloom Candle",
    price: 28,
    category: "Home",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
    description: "Soy wax candle with layered bergamot, velvet rose, and cedarwood notes."
  },
  {
    name: "MetroLink Smartwatch",
    price: 229.5,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
    description: "Premium smartwatch offering onboard LTE, NFC payments, and sleep insights."
  },
  {
    name: "Crescent Gold Studs",
    price: 54,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf629?auto=format&fit=crop&w=800&q=80",
    description: "Minimalist 14k gold-plated studs crafted with hypoallergenic posts."
  },
  {
    name: "Evergreen Planter Set",
    price: 42.5,
    category: "Home",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    description: "Set of three ceramic planters with drainage trays for indoor botanicals."
  },
  {
    name: "Frostline Parka",
    price: 249,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    description: "Weatherproof winter parka built with recycled fill and storm hood."
  },
  {
    name: "Sonic Brew Coffee Maker",
    price: 169,
    category: "Home",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    description: "Precision coffee brewer with bloom control and smart scheduling."
  }
];

// Function to clear old products and add new ones
async function seed() {
  try {
    // Remove all existing products first
    await Product.deleteMany({});
    // Insert the sample products
    const inserted = await Product.insertMany(products);
    console.log(`${inserted.length} products added`);
  } catch (err) {
    console.error("Seeding failed", err);
  } finally {
    await mongoose.connection.close();
  }
}

// Run seeding once database is connected
mongoose.connection.once("open", seed);
