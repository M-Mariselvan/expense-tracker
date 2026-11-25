# Expense Tracker

A full-stack expense tracking app. Add expenses, filter and sort them, and see where your money goes by category. Data is stored in MongoDB, so it persists across sessions and restarts.

> **Status:** core features are working. User accounts (login) and deployment are in progress, see the [Roadmap](#roadmap).

<!-- Add a screenshot of the app here, for example: -->
<!-- ![Expense Tracker screenshot](./screenshots/app.png) -->

## Features

- Add an expense with a title, amount, category, and date
- Delete expenses
- Filter by category and by month
- Sort by newest, oldest, highest, or lowest amount
- Live total for the current filters
- Spending summary by category with progress bars
- REST API backed by MongoDB, with server-side validation

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Tooling | ESLint, Git, GitHub |

## Project Structure

```
expense-tracker-client/
├── src/                # React app (components, styles)
├── server/             # Express API
│   ├── index.js        # Routes and MongoDB models
│   └── .env            # Secrets (not committed)
├── package.json        # Frontend dependencies
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20.6 or newer (the server uses the built-in `--env-file` flag)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- Git

### 1. Clone the repository

```bash
git clone https://github.com/M-Mariselvan/expense-tracker.git
cd expense-tracker
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a file named `.env` inside the `server` folder:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-address>/expenses
```

Replace the placeholders with your own Atlas database user and cluster address. In Atlas, make sure your IP address is allowed under **Network Access**.

Start the server:

```bash
node --watch --env-file=.env index.js
```

You should see `Server running at http://localhost:5000` and `Connected to MongoDB`.

### 3. Set up the frontend

In a second terminal, from the project root:

```bash
npm install
npm run dev
```

Open the address Vite prints, usually `http://localhost:5173`.

## API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/expenses` | List all expenses, newest first |
| POST | `/expenses` | Create an expense (`title`, `amount`, `category`, `date`) |
| DELETE | `/expenses/:id` | Delete an expense by id |

Example request body for `POST /expenses`:

```json
{
  "title": "Groceries",
  "amount": 450,
  "category": "Food",
  "date": "2026-10-17"
}
```

## Roadmap

- [x] Expense form, list, and delete
- [x] Filters, sorting, and category summary
- [x] Express API with MongoDB persistence
- [ ] User sign-up and login (JWT), with expenses linked to each user
- [ ] Loading and error states in the UI
- [ ] Charts for spending trends
- [ ] Live deployment

## What I Learned

- Structuring a full-stack app: React frontend, Express API, and a MongoDB database
- Building REST endpoints and connecting them to a React UI with `fetch`
- Keeping secrets out of version control with environment variables and `.gitignore`
- Configuring MongoDB Atlas network access and database users
- Using Git and GitHub with small, frequent commits

## Author

Built by Mariselvan M. GitHub: [@M-Mariselvan](https://github.com/M-Mariselvan)
