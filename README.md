# Full Stack Web Development - Assignment 3

This repository contains the complete solutions for **Assignment 3** of the Full Stack Web Development course. It encompasses 8 distinct enterprise-grade full-stack applications built using Express.js, MongoDB/Mongoose, Redis, Sequelize ORM, EJS, and React.js (Vite).

---

## 📋 Table of Contents

| Directory | Question / Feature Summary | Tech Stack | Port(s) |
|---|---|---|---|
| [**Q1**](./Q1/) | User Registration Form with File Uploads & Download Route | Express, EJS, Multer, Express-Validator | `3000` |
| [**Q2**](./Q2/) | Authentication System with File-based Session Store | Express, `session-file-store`, EJS | `3001` |
| [**Q3**](./Q3/) | Authentication System with Redis Session Store | Express, Redis (`ioredis` / `connect-redis`), EJS | `3002` |
| [**Q4**](./Q4/) | ERP Admin Panel: Employee CRUD, Salary Engine, Auto-Creds & Email | Express, Mongoose, EJS, Nodemailer, Bcrypt | `3004` |
| [**Q5**](./Q5/) | Employee Portal with JWT Auth, Profile, Leave Requests & Admin Approval | React (Vite), Express, Mongoose, JWT | Server: `5000`<br>Client: `5173` |
| [**Q6**](./Q6/) | Public API Integrations (Frontend & Backend Utility Mashup) | Express, Axios, Vanilla JS, HTML | `3006` |
| [**Q7**](./Q7/) | Full MERN Shopping Cart (2-Level Categories, Products, Admin & Storefront) | React (Vite), Express, Mongoose, REST | Server: `5007`<br>Client: `5174` |
| [**Q8**](./Q8/) | Student Management System (CRUD with Sequelize ORM & Modular MVC) | React (Vite), Express, Sequelize (SQLite/MySQL) | Server: `5008`<br>Client: `5175` |

---

## 🛠️ Prerequisites

Before getting started, make sure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (Recommended: Node `v20+` or `v22+`)
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` (Used by Q4, Q5, Q7) or MongoDB Atlas URI
- **Redis Server**: Running locally on `127.0.0.1:6379` (Required for Q3 session storage)
- **Git**: Installed for version control

---

## 🚀 Cloning & Global Setup

```bash
# 1. Clone the repository
git clone <YOUR_REPOSITORY_URL>

# 2. Navigate to the project root
cd Assignment-3
```

> **Note**: Each question is an isolated, self-contained project. You can run any question independently by navigating to its directory.

---

## 💻 Running the Projects

### 🔹 Question 1: User Registration with File Upload & Download
User registration form handling single and multiple file uploads with strict validations, sticky form fields on error, tabular result view, and downloadable uploaded files.

```bash
cd Q1
npm install
npm start
```
- **URL**: `http://localhost:3000`

---

### 🔹 Question 2: Express Login with File Session Store
Authentication system storing session data persistently in local files using `session-file-store`. Includes login, logout, and 2 protected routes (`/dashboard`, `/profile`).

```bash
cd Q2
npm install
npm start
```
- **URL**: `http://localhost:3001`
- **Default Credentials**: `admin` / `password123` or `student` / `student123`

---

### 🔹 Question 3: Express Login with Redis Session Store
Enterprise session management backed by Redis memory store (`connect-redis`). Includes session destruction on logout and authentication guards on protected routes.

```bash
# Ensure Redis server is active on localhost:6379
cd Q3
npm install
npm start
```
- **URL**: `http://localhost:3002`
- **Default Credentials**: `admin` / `admin123`

---

### 🔹 Question 4: ERP Admin Panel (Employee CRUD & Salary Calculation)
Session-authenticated Admin panel for employee management. Features auto-generation of Employee ID (`EMP...`) and random secure password, bcrypt hashing, automated net salary calculation (HRA, DA, deductions), and automated welcome email with credentials via Nodemailer.

```bash
cd Q4
npm install
# Ensure MongoDB is running on mongodb://127.0.0.1:27017
npm start
```
- **URL**: `http://localhost:3004`
- **Admin Credentials**: `admin` / `admin123`

---

### 🔹 Question 5: Employee Site (JWT Authentication + React.js)
Employee self-service portal connected to the Q4 employee schema. Features JWT authentication, profile viewing, leave application submission, employee leave list, and admin leave grant/reject toggle.

```bash
# Terminal 1 - Backend Server (Port 5000)
cd Q5/server
npm install
npm start

# Terminal 2 - React Client (Port 5173)
cd Q5/client
npm install
npm run dev
```
- **Employee Portal**: `http://localhost:5173`
- **Admin Approval Toggle**: Log in as `admin` / `admin123` to review and grant/reject leave requests.

---

### 🔹 Question 6: Public APIs Integration (Frontend & Backend)
Demonstrates live external API data fetching from both server-side and client-side utilities without external dependencies or frameworks:
- **Backend API**: Server fetches real-time meteorological data via Open-Meteo API.
- **Frontend APIs**: Browser directly fetches live foreign exchange rates and programming jokes.

```bash
cd Q6
npm install
npm start
```
- **URL**: `http://localhost:3006`

---

### 🔹 Question 7: MERN Shopping Cart with 2-Level Categories
Fullstack e-commerce solution featuring:
- **Hierarchical Categories**: 2-level categories (Main Category e.g., Electronics -> Subcategories e.g., Laptops, Smartphones).
- **Admin Site**: Category management, subcategory mapping, product creation with price and inventory.
- **Customer Storefront**: Category filtering, dynamic cart management, and order placement.

```bash
# Terminal 1 - Backend Server (Port 5007)
cd Q7/server
npm install
npm start

# Terminal 2 - React Client (Port 5174)
cd Q7/client
npm install
npm run dev
```
- **Storefront & Admin Site**: `http://localhost:5174`
- **Admin Login**: `admin@store.com` / `admin123`

---

### 🔹 Question 8: Student CRUD with Sequelize ORM
Relational database management application for student collections built with **Sequelize ORM** and **Express.js**, coupled with an unstyled **React.js (Vite)** frontend.

#### Modular Architecture:
- `config/db.js`: Sequelize instance (SQLite file `database.sqlite` for zero setup; switchable to MySQL in `.env`).
- `models/Student.js`: Sequelize model schema definition.
- `controllers/studentController.js`: CRUD handlers (`getAll`, `getById`, `create`, `update`, `delete`).
- `routes/studentRoutes.js`: Express router mapping REST endpoints.
- `server.js`: Server setup, auto-sync (`sequelize.sync()`), and database auto-seeding.

```bash
# Terminal 1 - Backend Server (Port 5008)
cd Q8/server
npm install
npm start

# Terminal 2 - React Client (Port 5175)
cd Q8/client
npm install
npm run dev
```
- **Backend API**: `http://localhost:5008/api/students`
- **React Frontend**: `http://localhost:5175`

---

## 🔒 Security & Best Practices

- **Zero-Commit Environment & Database Files**: `.gitignore` is pre-configured to exclude `node_modules/`, `.env`, and local SQLite database files (`*.sqlite`).
- **Password Security**: Uses `bcryptjs` for hashing user/admin credentials.
- **Stateless Tokens**: Uses `jsonwebtoken` (JWT) for secure API authorization in React frontends.
- **ORM / ODM Abstraction**: Uses Mongoose for NoSQL collections and Sequelize for relational entities to prevent injection attacks.

---

## 📄 License
This project is prepared for academic submission under the **701 - Full Stack Web Development** coursework.
