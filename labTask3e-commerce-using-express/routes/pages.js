const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
  res.render("home"); 
});

router.get("/checkout", (req, res) => {
  res.render("checkout"); 
});

module.exports = router;
