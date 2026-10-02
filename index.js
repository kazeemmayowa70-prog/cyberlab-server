const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// Secret key used to sign tokens (temporary, for learning only)
const JWT_SECRET = "change-this-secret-later";

// Temporary storage (lost when the server stops)
const users = [];

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

  if (users.find((u) => u.username === username)) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // First account ever created becomes admin (learning shortcut)
  const role = users.length === 0 ? "admin" : "user";
  users.push({ username, passwordHash, role });

  res.status(201).json({ message: "Account created", role });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = users.find((u) => u.username === username);

  const fail = () =>
    res.status(401).json({ error: "Invalid username or password" });

  if (!user) return fail();

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return fail();

  const token = jwt.sign(
    { username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ message: "Login successful", token });
});

// Middleware: checks the token on every protected route
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

// Middleware: only lets admins through
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
