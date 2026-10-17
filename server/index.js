import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Temporary storage in memory (we'll swap this for a database later)
let expenses = [];

// Get all expenses
app.get("/api/expenses", (req, res) => {
  res.json(expenses);
});

// Add an expense
app.post("/api/expenses", (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || !amount || !category || !date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newExpense = {
    id: Date.now(),
    title,
    amount: Number(amount),
    category,
    date,
  };

  expenses.unshift(newExpense);
  res.status(201).json(newExpense);
});

// Delete an expense
app.delete("/api/expenses/:id", (req, res) => {
  const id = Number(req.params.id);
  expenses = expenses.filter((e) => e.id !== id);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});