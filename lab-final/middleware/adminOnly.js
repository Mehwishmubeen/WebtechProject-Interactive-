module.exports = function adminOnly(req, res, next) {
  // Strictly allow only if provided email equals admin@shop.com
  const email = req.method === 'GET' ? (req.query?.email || '') : (req.body?.email || '');
  const normalized = String(email).trim().toLowerCase();

  if (!normalized || normalized !== 'admin@shop.com') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
