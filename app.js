const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// Dummy user storage
let users = [];

// Routes

// Home route (Redirect to Login)
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Register route
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash("error_msg", "Passwords do not match");
    return res.redirect("/register");
  }

  // Check if user already exists
  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    req.flash("error_msg", "Username already exists");
    return res.redirect("/register");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  req.flash("success_msg", "You are now registered");
  res.redirect("/login");
});

// Login route
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) {
    req.flash("error_msg", "User does not exist");
    return res.redirect("/login");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    req.flash("error_msg", "Invalid credentials");
    return res.redirect("/login");
  }

  req.session.isAuthenticated = true;
  req.session.username = username;
  req.flash("success_msg", "Logged in successfully");
  res.redirect("/dashboard");
});

// Dashboard route (Protected)
const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) return next();
  req.flash("error_msg", "Please log in to view this page");
  res.redirect("/login");
};

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { username: req.session.username });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
});

// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
