import { useState, useEffect } from "react";
import "./App.css";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Other"];

function App() {
  const API = "http://localhost:5000/api/expenses";

  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => console.error("Could not load expenses:", err));
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !amount || !date) return;

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), amount, category, date }),
    });
    if (!res.ok) return;

    const saved = await res.json();
    setExpenses([saved, ...expenses]);
    setTitle("");
    setAmount("");
    setDate("");
  }

  async function handleDelete(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setExpenses(expenses.filter((expense) => expense.id !== id));
  }
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState("");

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterMonth, setFilterMonth] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  const visible = expenses
    .filter(
      (e) =>
        (filterCategory === "All" || e.category === filterCategory) &&
        (!filterMonth || e.date.startsWith(filterMonth))
    )
    .sort((a, b) => {
      if (sortBy === "date-asc") return a.date.localeCompare(b.date);
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return b.date.localeCompare(a.date);
    });

  const total = visible.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    total: visible
      .filter((e) => e.category === c)
      .reduce((sum, e) => sum + e.amount, 0),
  })).filter((item) => item.total > 0);

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

      <div className="filters">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>
      </div>

      <h2>Total: ₹{total.toFixed(2)}</h2>

      {byCategory.length > 0 && (
        <div className="summary">
          {byCategory.map((item) => (
            <div key={item.category} className="summary-row">
              <span>{item.category}</span>
              <div className="bar-track">
                <div
                  className="bar"
                  style={{ width: `${(item.total / total) * 100}%` }}
                />
              </div>
              <span>₹{item.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p>No expenses to show. Add one above or change the filters.</p>
      ) : (
        <ul className="list">
          {visible.map((e) => (
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