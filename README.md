

# 💸 Finverse – AI-Powered Personal Finance Copilot

Finverse is a full-stack **AI Finance Assistant** that helps users:
- Track expenses & analyze spending  
- Plan budgets, investments, insurance & taxes  
- Chat with an **AI financial advisor** (Botpress)  
- Visualize financial health with interactive dashboards  

Built using a modern stack:  
**React + Vite + Tailwind + Recharts + Framer Motion (frontend)**  
**Node.js + Express + MongoDB + JWT + Google Gemini API (backend)**



# 🚀 Features

### 🔐 Secure Auth & User Profiles
- JWT authentication (`/api/auth`)
- Register/Login with encrypted passwords  
- Protected routes using middleware  
- User profile stored in MongoDB  

### 📊 Interactive Finance Dashboard
Includes:
- Net worth snapshot  
- Monthly spending analysis  
- Savings & investment insights  
- Quick navigation cards (Expenses, Investments, Tax, Insurance)  

### 💳 Smart Expense Analytics
- Category distribution chart  
- Monthly total and percentage stats  
- Beautiful UI built with Tailwind + Recharts  

### 📈 Investment Overview
- Cautious / Balanced / Aggressive risk profiles  
- Simple projected return logic  
- Helps users understand long-term outcomes  

### 🛡 Insurance Planner
- Health, Car, Home, Life insurance suggestions  
- Coverage guidance based on common financial rules  

### 📉 Credit Score Helper
- Educational simulator  
- Shows impact of credit utilization, on-time payments  

### 📝 Budget Planner & Tax Helper
- Basic budgeting plan  
- Tax bracket-based tax estimation  

### 🤖 Dual AI Copilot (Gemini + Botpress)

#### 1️⃣ Backend AI – Google Gemini  
Route:

- Uses **Gemini 2.5 Flash** model  
- Custom system prompt designed to act as a **personal finance expert**  
- Helps users with budgeting, savings, investment choices, risk profiles  
- Response returned as `{ "reply": "..." }`  

#### 2️⃣ Frontend AI – Botpress Web Chat Widget  
Component:

- Floating chatbot widget  
- Configured with your Botpress Assistant  
- Provides quick finance Q&A inside the UI  

---

# 🧱 Architecture
```
          ┌─────────────────────────────┐
          │         Frontend (React)    │
          │  - Vite + Tailwind          │
          │  - Recharts + Framer Motion │
          │  - React Router             │
          └─────────────┬───────────────┘
                        │ axios / fetch
                        ▼
          ┌─────────────────────────────┐
          │       Backend (Express)     │
          │  /api/auth  – JWT auth      │
          │  /api/chat  – Gemini AI     │
          └─────────────┬───────────────┘
                        │ Mongoose
                        ▼
          ┌─────────────────────────────┐
          │         MongoDB Atlas       │
          │   Users, profiles, tokens   │
          └─────────────────────────────┘
```

---

# 📂 Project Structure
```
Finverse-AI-Finance/
│
├── client/ # React + Vite + Tailwind frontend
│ ├── src/
│ │ ├── App.jsx # Routes
│ │ ├── main.jsx # App entry
│ │ ├── components/
│ │ │ ├── Layout.jsx # Sidebar + header
│ │ │ ├── Sidebar.jsx
│ │ │ ├── ProtectedRoute.jsx
│ │ │ └── Chatbot.jsx # Botpress widget
│ │ └── pages/
│ │ ├── Dashboard.jsx
│ │ ├── Expenses.jsx
│ │ ├── Investments.jsx
│ │ ├── Insurance.jsx
│ │ ├── CreditScore.jsx
│ │ ├── BudgetPlanner.jsx
│ │ ├── TaxFiling.jsx
│ │ ├── Login.jsx
│ │ └── Register.jsx
│ ├── package.json
│ └── vite.config.js
│
├── server/ # Node.js + Express backend
│ ├── src/
│ │ ├── index.js # Main backend server
│ │ ├── models/
│ │ │ └── User.js
│ │ ├── middleware/
│ │ │ └── authMiddleware.js
│ │ └── routes/
│ │ ├── auth.js # Register/Login
│ │ └── chatbot.js # Gemini AI advisor
│ ├── package.json
│ └── .env (ignored)
```


