# 💰 Expense Tracker Pro

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000.svg?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, full-featured **Personal Finance & Collaborative Group Expense Management** web application built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) and styled with **Tailwind CSS**.

Manage your daily personal income and expenses, set monthly spending limits with automated alerts, visualize financial health through interactive charts, and effortlessly split flat/trip bills with friends using pooled common bank tracking and out-of-pocket reimbursements.

---

## 📑 Table of Contents

- [Features](#-features)
  - [Personal Finance Management](#1-personal-finance-management)
  - [Roommate & Group Expense Splitting](#2-roommate--group-expense-splitting)
  - [Security & Authentication](#3-security--authentication)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Environment Variables](#environment-variables)
  - [Seed Demo Data](#seed-demo-data)
  - [Running the Application](#running-the-application)
- [API Reference](#-api-reference)
- [Demo Credentials](#-demo-credentials)
- [How to Push to GitHub](#-how-to-push-to-github)
- [License](#-license)

---

## 🌟 Features

### 1. Personal Finance Management
- **Interactive KPI Dashboard**: Live indicators for Total Balance, Monthly Income, Monthly Expenses, and Net Savings Rate.
- **Visual Analytics with Recharts**:
  - Donut Chart breakdown of spending by category (Food, Rent, Shopping, Bills, etc.).
  - 6-month historical Bar Chart comparing income vs expenditures.
- **Smart Monthly Budget Planner**:
  - Set custom monthly spending thresholds (e.g. ₹20,000).
  - Dynamic visual alert badges:
    - 🟢 **Safe** (< 80% utilized)
    - 🟡 **Warning** (80% - 99% utilized)
    - 🔴 **Danger** (100%+ limit exceeded)
  - Daily spending allowance recommendation based on remaining days.
- **Complete Transaction Control (CRUD)**:
  - Add, edit, and delete transactions with custom notes and payment methods (UPI, Cash, Credit Card, Net Banking).
  - Multi-criteria filtering by type, category, date range, and text search.
- **One-Click CSV Export**: Download filtered transaction records formatted for Excel or Google Sheets.

### 2. Roommate & Group Expense Splitting
- **Group Creation & Admin Approvals**: Create flat or trip groups with unique invite codes (e.g., `GRP-FLAT402`). Unapproved members must be accepted by the admin.
- **Common Flat Bank Account Tracker**:
  - Track pooled deposits contributed by each roommate into a common fund.
  - Transparent overview of Current Bank Balance, Total Deposited, and Direct Flat Expenses.
- **Out-of-Pocket Reimbursement System**:
  - Separate payment sources: **Paid from Pocket (Refund Owed)** vs **Paid directly from Common Bank**.
  - Highlights exact amount the common bank owes back to roommates who paid out-of-pocket for groceries, bills, or supplies.
  - **1-Click "Mark as Reimbursed"**: Easily settle refund claims once transferred via UPI or cash.
- **Transparent Equal Share Settlement**:
  - Automated calculation of equal share per roommate.
  - Clear breakdown showing who gets money back and who owes money.

### 3. Minimalist UI & Theme Customization
- **🌓 Dark & Light Mode Toggle**: Instant 1-click switching with smooth CSS transitions, system preference detection, and `localStorage` persistence (zero-flash on load).
- **🎨 Minimalist Clean Aesthetic**: Soft border contrasts, clean spacing, glassmorphic headers, subtle hover micro-interactions, and custom vector favicon.

### 4. Security & Authentication
- Secure JWT-based authentication with `httpOnly` authorization headers.
- Password hashing using `bcryptjs`.
- Protected private routes for both frontend pages and backend REST endpoints.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Recharts, Lucide React, Axios, React Router v7, React Hot Toast |
| **Backend** | Node.js, Express.js, Mongoose (MongoDB ODM), jsonwebtoken, bcryptjs, Morgan, CORS, Dotenv |
| **Database** | MongoDB Atlas (Cloud) / Local MongoDB |

---

## 📁 Project Architecture

```text
Expence-Tracker/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection configuration
│   ├── controllers/
│   │   ├── authController.js        # Authentication & user profile handlers
│   │   ├── groupController.js       # Group management & reimbursement logic
│   │   └── transactionController.js # Transaction CRUD, summary & CSV export
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification middleware
│   │   └── errorMiddleware.js       # Global error handler
│   ├── models/
│   │   ├── Group.js                 # Group & membership schema
│   │   ├── GroupTransaction.js      # Group expense & pool deposit schema
│   │   ├── Transaction.js           # Personal transaction schema
│   │   └── User.js                  # User schema with budget preferences
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth routes
│   │   ├── groupRoutes.js           # /api/groups routes
│   │   └── transactionRoutes.js     # /api/transactions routes
│   ├── .env.example                 # Sample environment variables
│   ├── seeder.js                    # Demo dataset seeder
│   ├── server.js                    # Express application entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable UI components (Navbar, Modals, Charts)
│   │   ├── context/                 # AuthContext & TransactionContext
│   │   ├── pages/                   # Dashboard, Transactions, Analytics, Groups, Budget
│   │   ├── services/api.js          # Centralized Axios client
│   │   ├── utils/formatters.js      # Formatting helpers (Currency, Dates)
│   │   ├── App.jsx                  # Main route configuration
│   │   └── main.jsx                 # Application entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore                       # Root gitignore protecting secrets & node_modules
├── package.json                     # Root orchestrator scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local installation or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- [Git](https://git-scm.com/)

---

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/expense-tracker-pro.git
   cd expense-tracker-pro
   ```

2. **Install root & workspace dependencies**:
   ```bash
   # Install root scripts
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   cd ..
   ```

---

### Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# In backend/.env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/expense_tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
```

*(You can also reference `backend/.env.example` as a template).*

---

### Seed Demo Data

To load realistic test transactions, budget settings, and a sample Flatmates Group (`GRP-FLAT402`):

```bash
npm run seed
```

---

### Running the Application

You can start both backend and frontend from the root project folder:

**Option A — Separate Terminals:**
```bash
# Terminal 1: Start Backend (Port 5000)
npm run server

# Terminal 2: Start Frontend (Port 5173)
npm run client
```

**Option B — Direct Directory Execution:**
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Reference

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & get token | Public |
| `GET` | `/api/auth/me` | Get authenticated user profile | Private |
| `PUT` | `/api/auth/update-budget` | Update monthly spending limit | Private |

### Transaction Routes (`/api/transactions`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/transactions` | Get paginated & filtered transactions | Private |
| `POST` | `/api/transactions` | Create a new transaction | Private |
| `GET` | `/api/transactions/:id` | Fetch single transaction details | Private |
| `PUT` | `/api/transactions/:id` | Update transaction | Private |
| `DELETE` | `/api/transactions/:id` | Delete transaction | Private |
| `GET` | `/api/transactions/summary` | Analytics & chart aggregations | Private |
| `GET` | `/api/transactions/export/csv` | Download transactions as CSV | Private |

### Group Routes (`/api/groups`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/groups` | Create group with invite code | Private |
| `GET` | `/api/groups` | List user's active groups | Private |
| `GET` | `/api/groups/:id` | Group details, balances & claims | Private |
| `POST` | `/api/groups/join` | Request to join via invite code | Private |
| `PUT` | `/api/groups/:id/requests/:userId/approve` | Admin approves member | Admin |
| `PUT` | `/api/groups/:id/requests/:userId/reject` | Admin rejects member | Admin |
| `POST` | `/api/groups/:id/transactions` | Add expense or pool deposit | Member |
| `PUT` | `/api/groups/:id/transactions/:txId` | Edit group transaction | Member |
| `DELETE` | `/api/groups/:id/transactions/:txId` | Delete group transaction | Member |
| `PUT` | `/api/groups/:id/transactions/:txId/reimburse` | Toggle reimbursement status | Member |

---

## 🔑 Demo Credentials

For quick evaluation and review:
- **Email**: `demo@expensetracker.com`
- **Password**: `demo1234`
- **Sample Flat Invite Code**: `GRP-FLAT402`

---

## 📤 How to Push to GitHub

Follow these steps to upload this project to your GitHub account:

1. **Initialize Git** in the project root:
   ```bash
   git init
   ```

2. **Stage files and commit**:
   ```bash
   git add .
   git commit -m "feat: complete expense tracker pro with group settlements"
   ```

3. **Rename branch to main**:
   ```bash
   git branch -M main
   ```

4. **Link your GitHub repository & push**:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

*(Your `.gitignore` file is already preconfigured to protect your `.env` passwords and ignore `node_modules`).*

---

## 💖 Author & Credits

> *"Beware of little expenses; a small leak will sink a great ship."* — **Benjamin Franklin**  
> *"Do not save what is left after spending, but spend what is left after saving."* — **Warren Buffett**

Crafted with lots of love ❤️, dedication, and endless cups of chai ☕ by **Rishav Ranjan**.

---

## 📄 License & Copyright

&copy; 2026 **Expense Tracker Pro**. Copyright by **Rishav Ranjan**. All rights reserved.  
Licensed under the [MIT License](LICENSE).

