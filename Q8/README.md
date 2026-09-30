# Question 8: Student CRUD Application using Sequelize (Express + Sequelize + React)

A complete fullstack CRUD application for a **Student** entity using **Express.js**, **Sequelize ORM**, and **React.js (Vite)** with a **strictly modular architecture** and **NO CSS** (pure browser-default HTML elements).

---

## 🌟 Architecture & Features

### 1. Modular Backend Architecture (`Q8/server`)
The backend is structured into separate, decoupled modules:
- **`config/db.js`**: Sequelize database connection instance (configured with SQLite `database.sqlite` for zero-configuration local execution, with option for MySQL via `.env`).
- **`models/Student.js`**: Sequelize model schema definition for the `Student` entity:
  - `rollNo`: String (Unique, Required)
  - `name`: String (Required)
  - `email`: String (Required)
  - `course`: String (e.g. Computer Engineering, Information Technology)
  - `semester`: Integer (1 to 8)
  - `cpi`: Float (0.0 to 10.0)
- **`controllers/studentController.js`**: Pure controller handlers containing business logic:
  - `getAllStudents`: Fetch all student records sorted chronologically.
  - `getStudentById`: Fetch a specific student by primary key (`id`).
  - `createStudent`: Validate required fields, prevent duplicate `rollNo`, and persist new record.
  - `updateStudent`: Update existing record with unique constraint validation.
  - `deleteStudent`: Delete student by `id`.
- **`routes/studentRoutes.js`**: Express router mapping REST endpoints to controller methods:
  - `GET /api/students` -> `getAllStudents`
  - `GET /api/students/:id` -> `getStudentById`
  - `POST /api/students` -> `createStudent`
  - `PUT /api/students/:id` -> `updateStudent`
  - `DELETE /api/students/:id` -> `deleteStudent`
- **`server.js`**: Express server initialization, middleware setup, route mounting, database synchronization (`sequelize.sync()`), and automatic initial sample data seeding.

### 2. Frontend Created via Vite CLI (`Q8/client`)
Scaffolded using the official Vite CLI command:
```powershell
npx -y create-vite@latest client --template react --no-interactive --overwrite
```
- **Create**: Add new student form with validation.
- **Read**: Interactive table listing all students with real-time live search filter.
- **Update**: Click "Edit" to populate the student into the form, modify fields, and save changes.
- **Delete**: Click "Delete" to remove the student with a confirmation dialog.
- **NO CSS**: Pure semantic HTML elements (`<form>`, `<table>`, `<input>`, `<select>`, `<button>`).

---

## 🚀 How to Run

### Step 1: Start the Backend (Port 5008)
```powershell
cd d:\Sem_7\701-fullstack\Assignment-3\Q8\server
npm install
npm start
```
*Backend runs at `http://localhost:5008` and automatically synchronizes the table and seeds 3 initial student records.*

### Step 2: Start the React Frontend (Port 5175)
```powershell
cd d:\Sem_7\701-fullstack\Assignment-3\Q8\client
npm install
npm run dev
```
*Frontend runs at `http://localhost:5175` with proxy `/api` pointing to `http://localhost:5008`.*
