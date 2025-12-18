require("dotenv").config();
const express = require("express");
const path = require("path");

require("./db");

const app = express();

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Body parsing & static assets
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
const pagesRoute = require("./routes/pages");
app.use("/", pagesRoute);


app.listen(3000, () => console.log("Server running at http://localhost:3000"));
