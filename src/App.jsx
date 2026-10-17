import { useState } from "react";
import "./App.css";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Other"];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !amount || !date) return;

    const newExpense = {
      id: Date.now(),
      title: title.trim(),
      amount: Number(amount),
      category,
      date,
    };

    setExpenses([newExpense, ...expenses]);
    setTitle("");
    setAmount("");
    setDate("");
  }

  function handleDelete(id) {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="app">
      <h1>Expense Tracker</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="What did you spend on?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit">Add expense</button>
      </form>

      <h2>Total: ₹{total.toFixed(2)}</h2>

      {expenses.length === 0 ? (
        <p>No expenses yet. Add your first one above.</p>
      ) : (
        <ul className="list">
          {expenses.map((e) => (
            <li key={e.id}>
              <div>
                <strong>{e.title}</strong>
                <span>
                  {e.category} · {e.date}
                </span>
              </div>
              <div>
                ₹{e.amount.toFixed(2)}
                <button onClick={() => handleDelete(e.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;