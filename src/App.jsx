import { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000/api";
const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Other"];

function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      onAuth(data.token, data.user.email);
    } catch (err) {
      setError("Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>Expense Tracker</h1>
      <h2>{mode === "login" ? "Log in" : "Create an account"}</h2>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (at least 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <p>
        {mode === "login" ? "New here? " : "Already have an account? "}
        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "Create an account" : "Log in"}
        </button>
      </p>
    </div>
  );
}

function Tracker({ token, email, onLogout }) {
  const API = `${API_BASE}/expenses`;

  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState("");

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterMonth, setFilterMonth] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    fetch(API, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status === 401) {
          onLogout();
          throw new Error("Session expired");
        }
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => setExpenses(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Could not load expenses:", err));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !amount || !date) return;

    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: title.trim(), amount, category, date }),
    });
    if (res.status === 401) return onLogout();
    if (!res.ok) return;

    const saved = await res.json();
    setExpenses([saved, ...expenses]);
    setTitle("");
    setAmount("");
    setDate("");
  }

  async function handleDelete(id) {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) return onLogout();
    if (!res.ok) return;
    setExpenses(expenses.filter((expense) => expense.id !== id));
  }

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
      <div className="topbar">
        <h1>Expense Tracker</h1>
        <div>
          <span className="user">{email}</span>
          <button onClick={onLogout}>Log out</button>
        </div>
      </div>

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

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "");

  function handleAuth(newToken, newEmail) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("email", newEmail);
    setToken(newToken);
    setEmail(newEmail);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setEmail("");
  }

  if (!token) return <AuthForm onAuth={handleAuth} />;
  return <Tracker key={token} token={token} email={email} onLogout={handleLogout} />;
}

export default App;