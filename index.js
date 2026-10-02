const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { DatabaseSync } = require("node:sqlite");

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { console.error("JWT_SECRET is missing"); process.exit(1); }

// Real database file (kept on the phone, survives restarts)
const db = new DatabaseSync("cyberlab.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
  )
`);

app.get("/", (req, res) => {
  res.send("CyberLab server is running");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be 8+ characters" });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username);
  if (existing) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // First account ever created becomes admin (learning shortcut)
  const count = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  const role = count === 0 ? "admin" : "user";

  db.prepare(
    "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)"
  ).run(username, passwordHash, role);

  res.status(201).json({ message: "Account created", role });
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts. Try again later." },
});

app.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);

  const fail = () =>
    res.status(401).json({ error: "Invalid username or password" });

  if (!user) return fail();

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return fail();

  const token = jwt.sign(
    { username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ message: "Login successful", token });
});

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or missing token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

app.get("/profile", requireAuth, (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
});

app.get("/admin", requireAuth, requireAdmin, (req, res) => {
  res.json({ message: "Welcome, admin. This data is admin-only." });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
