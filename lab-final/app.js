// Load environment variables from .env file
require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");

// Connect to MongoDB
require("./db");

const app = express();

// Set up EJS as our template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Middleware to handle form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve static files (CSS, images, JS)
app.use(express.static(path.join(__dirname, "public")));
// Enable sessions for cart and admin authentication
app.use(
	session({
		secret: process.env.SESSION_SECRET || "dev_session_secret",
		resave: false,
		saveUninitialized: true
	})
);

// Log all requests for debugging
app.use((req, res, next) => {
	console.log(`${req.method} ${req.path} - Query:`, req.query);
	next();
});

// Load general routes (home, products, checkout)
const pagesRoute = require("./routes/pages");
app.use("/", pagesRoute);

// Admin routes come after general routes to avoid conflicts
const Order = require("./models/order");

// Check if user is logged in as admin before accessing admin pages
function requireAdminAuth(req, res, next) {
	if (req.session && req.session.adminEmail === 'admin@shop.com') {
		return next();
	}
	res.redirect('/admin/login');
}

// Show the admin login page
app.get("/admin/login", (req, res) => {
	res.render("admin-login", { error: null });
});

// Process admin login - only admin@shop.com can access
app.post("/admin/login", (req, res) => {
	const email = String(req.body?.email || "").trim().toLowerCase();
	if (email === 'admin@shop.com') {
		// Save admin email in session and redirect to orders
		req.session.adminEmail = email;
		res.redirect('/admin/orders');
	} else {
		res.render("admin-login", { error: "Invalid admin email. Please use admin@shop.com" });
	}
});

// Admin logout
app.get("/admin/logout", (req, res) => {
	req.session.adminEmail = null;
	res.redirect('/');
});

// Show all orders to admin (requires login)
app.get("/admin/orders", requireAdminAuth, async (req, res, next) => {
	console.log("=== ADMIN ORDERS ROUTE HIT ===");
	console.log("Admin:", req.session.adminEmail);
	try {
		// Get all orders sorted by newest first
		const orders = await Order.find().sort({ createdAt: -1 });
		console.log(`Found ${orders.length} orders`);
		res.render("admin-orders", { orders });
	} catch (err) {
		console.error("Error in /admin/orders:", err);
		res.status(500).send("Error loading admin page: " + err.message);
	}
});

// Let admin update order status (Confirm or Cancel)
app.post("/admin/orders/:id/status", requireAdminAuth, async (req, res, next) => {
	console.log("=== UPDATE STATUS ROUTE HIT ===");
	try {
		const orderId = req.params.id;
		const status = String(req.body?.status || "").trim();
		// Only these statuses are valid
		const allowed = ["Pending", "Confirmed", "Cancelled"];
		if (!allowed.includes(status)) {
			return res.status(400).json({ error: "Invalid status" });
		}
		// Update the order in database
		const updated = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
		if (!updated) return res.status(404).json({ error: "Order not found" });
		res.json({ ok: true, order: { _id: updated._id, status: updated.status, totalAmount: updated.totalAmount, customerName: updated.customerName, createdAt: updated.createdAt } });
	} catch (err) {
		console.error("Error updating order status:", err);
		res.status(500).json({ error: err.message });
	}
});


app.listen(3000, () => console.log("Server running at http://localhost:3000"));
