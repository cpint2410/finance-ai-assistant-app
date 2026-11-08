# 💰 Full-Stack Expense Tracker

A modern, full-stack personal finance management application designed to help users manage their income, track expenses, monitor budgets and gain insights into their financial habits.

🌐 Live Application: [https://full-stack-expense-tracker-3trd.onrender.com/](https://full-stack-expense-tracker-3trd.onrender.com/)

## ✨ Features

- 🔐 Google Authentication – Secure user authentication using Firebase.
- 💸 Expense Tracking – Add, edit and manage expenses.
- 💰 Income Management – Record and manage income.
- 📊 Interactive Dashboard – View financial summaries and activity.
- 🗂️ Category Management – Organise income and expenses into categories.
- 🎯 Budget Management – Create and monitor budgets.
- 📈 Financial Reports – Analyse financial activity and spending trends.
- 🔮 Financial Forecasting – Explore potential future financial patterns.
- 🤖 AI Financial Assistance – AI-powered financial insights.
- 👤 User Profiles – Manage personal account information.
- 📱 Responsive Design – User-friendly interface across devices.

## 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript

### Database

- PostgreSQL
- Neon
- Drizzle ORM

### Authentication

- Firebase Authentication
- Google Sign-In

### AI Integration

- Google Gemini API

### Deployment

- Render
- GitHub

## 🚀 Live Deployment

The application is deployed using Render and connects to a PostgreSQL database hosted on Neon.

Live Demo: [https://full-stack-expense-tracker-3trd.onrender.com/](https://full-stack-expense-tracker-3trd.onrender.com/)

## 💻 Run Locally

### Prerequisites

- Node.js
- npm
- PostgreSQL database
- Firebase project
- Gemini API key (for AI functionality)

### 1. Clone the repository

bash

```bash
git clone YOUR-GITHUB-REPOSITORY-URL
```

### 2. Navigate to the project

bash

```bash
cd full-stack-expense-tracker
```

### 3. Install dependencies

bash

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

env

```env
NODE_ENV=development
PORT=3000

SQL_HOST=your_database_host
SQL_USER=your_database_user
SQL_PASSWORD=your_database_password
SQL_DB_NAME=your_database_name

GEMINI_API_KEY=your_gemini_api_key
```

Configure your Firebase project credentials using the Firebase configuration file.

### 5. Start the development server

bash

```bash
npm run dev
```

Open your browser:

text

```text
http://localhost:3000
```

## 🏗️ Production Build

Build the application:

bash

```bash
npm run build
```

Start the production server:

bash

```bash
node dist/server.cjs
```

## 🔒 Security

- Firebase Authentication for user authentication.
- Protected backend API endpoints.
- Environment variables for sensitive configuration.
- SSL-secured PostgreSQL connections.
- Token-based authentication for API requests.

Important: Never commit `.env` files, database passwords, API keys or other private credentials to GitHub.

## 👨‍💻 Project

This project demonstrates full-stack web development, including:

- Frontend application development.
- Backend API development.
- Relational database integration.
- User authentication.
- Financial data management.
- AI service integration.
- Cloud deployment and production configuration.

## ⭐ Thank You\!

Thank you for checking out my Full-Stack Expense Tracker\!

If you find this project interesting, feel free to explore the live application and check out the source code.
