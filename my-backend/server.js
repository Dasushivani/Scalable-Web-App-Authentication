const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const SECRET_KEY = "your_secret_key"; // Replace with a strong key in production

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/myapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ User model
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: String,
  password: String,
}));

// ✅ JWT Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
}

// ✅ Signup route
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  res.json({ message: "Signup successful!" });
});

// ✅ Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ name: user.name, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ message: "Login successful!", token });
});

// ✅ Protected profile route
app.get("/api/profile", verifyToken, async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ name: user.name, email: user.email });
});

// ✅ Temporary delete user route
app.delete("/api/delete-user", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const result = await User.deleteOne({ email });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ message: "User deleted successfully" });
});

// ✅ Notes model with category and timestamps
const noteSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    email: String,
    category: String, // ✅ New field
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

// ✅ Create a note
app.post("/api/notes", verifyToken, async (req, res) => {
  const { title, content, category } = req.body;
  const email = req.user.email;

  const note = new Note({ title, content, category, email });
  await note.save();
  res.json({ message: "Note created", note });
});

// ✅ Get all notes for logged-in user
app.get("/api/notes", verifyToken, async (req, res) => {
  const notes = await Note.find({ email: req.user.email });
  res.json(notes);
});

// ✅ Update a note
app.put("/api/notes/:id", verifyToken, async (req, res) => {
  const { title, content, category } = req.body;

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, email: req.user.email },
    { title, content, category },
    { new: true }
  );

  if (!note) return res.status(404).json({ message: "Note not found" });
  res.json({ message: "Note updated", note });
});

// ✅ Delete a note
app.delete("/api/notes/:id", verifyToken, async (req, res) => {
  const result = await Note.deleteOne({ _id: req.params.id, email: req.user.email });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Note not found" });
  }
  res.json({ message: "Note deleted" });
});

// ✅ Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});