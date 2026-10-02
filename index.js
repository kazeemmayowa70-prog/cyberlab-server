const express = require("express");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

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
  users.push({ username, passwordHash, role: "user" });

  res.status(201).json({ message: "Account created" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = users.find((u) => u.username === username);

  // Same message for "no such user" and "wrong password"
  const fail = () =>
    res.status(401).json({ error: "Invalid username or password" });

  if (!user) return fail();

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return fail();

  res.json({ message: "Login successful", role: user.role });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
