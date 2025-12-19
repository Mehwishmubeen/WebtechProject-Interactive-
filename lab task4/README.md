# Lab Task 4 – Admin Panel

This project implements an admin panel for an e-commerce application using Node.js, Express, EJS layouts, and MongoDB via Mongoose. The admin experience is separated from the storefront layout and provides CRUD management for products.

## Features

- Dedicated admin layout distinct from the storefront UI
- Dashboard with key metrics and recent products
- Full product CRUD (create, read, update, delete)
- MongoDB data persistence with Mongoose models
- Server-side rendered views using EJS and express-ejs-layouts

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally or a connection string to a hosted instance

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server with hot reload:

   ```bash
   npm run dev
   ```

3. Or run in production mode:

   ```bash
   npm start
   ```

4. Visit `http://localhost:3000/` for the storefront view and `http://localhost:3000/admin` for the admin panel.

## Project Structure

- `server.js` – bootstraps MongoDB connection and starts the server
- `app.js` – configures middleware, layouts, and routes
- `models/Product.js` – Mongoose schema for products
- `controllers/` – route handlers for admin functionality
- `routes/admin.js` – admin panel routes
- `views/` – EJS templates for layouts, admin pages, and errors
- `public/css/` – styling for storefront and admin layouts

## Scripts

- `npm start` – run the server with Node
- `npm run dev` – run the server with nodemon for development

## Testing the Admin Panel

1. Ensure MongoDB is running and connection details are configured.
2. Open `http://localhost:3000/admin/products/new` to add a product.
3. Use the products list to edit or delete entries.
4. Verify the dashboard reflects the current product data.

## License

This project is provided for educational purposes as part of Lab Task 4.
