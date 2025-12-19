// Middleware to prevent checkout with an empty cart
module.exports = function checkCartNotEmpty(req, res, next) {
  // Check both client-side cart (from localStorage) and session cart
  const items = Array.isArray(req.body?.items)
    ? req.body.items
    : (req.session?.cart?.items || []);

  // Block the request if cart is empty
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }
  next();
}
