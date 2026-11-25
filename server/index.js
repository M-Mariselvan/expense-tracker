import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("Missing JWT_SECRET in .env");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// ---------- Models ----------
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  date: { type: String, required: true },
});

expenseSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.user;
  },
});
const Expense = mongoose.model("Expense", expenseSchema);

// ---------- Helpers ----------
function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ---------- Auth routes ----------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });

    res.status(201).json({ token: signToken(user.id), user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Could not register" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    res.json({ token: signToken(user.id), user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Could not log in" });
  }
});

// ---------- Expense routes (login required) ----------
app.get("/api/expenses", requireAuth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({ date: -1, _id: -1 });
    res.json(expenses);
  } catch (err) {
    console.error("GET /api/expenses failed:", err.message);
    res.status(500).json({ error: "Could not load expenses" });
  }
});

app.post("/api/expenses", requireAuth, async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    if (!title || !amount || !category || !date) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const expense = await Expense.create({
      user: req.userId,
      title,
      amount,
      category,
      date,
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: "Could not save expense" });
  }
});

app.delete("/api/expenses/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ error: "Expense not found" });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: "Invalid expense id" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});