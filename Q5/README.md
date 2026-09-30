# Question 5: Employee Site with JWT Authentication (React + Express + Mongoose)

Develop an employee site (referencing Q4 ERP system) with JWT authentication for employees using **Mongoose**, **Express**, and **React.js**.

---

## 🌟 Key Features

1. **JWT Authentication**:
   - Employees created in **Q4** log in using their Employee ID (`empid`) or Email and generated password.
   - Generates a signed **JSON Web Token (JWT)** stored in the client and sent with the `Authorization: Bearer <token>` header.
2. **Home Page**:
   - Welcome banner with employee greeting.
   - Navigation links directly to **Page 1 (Profile)** and **Page 2 (Leave Application)**.
   - Active session details (JWT status, Employee ID, Department, Designation).
3. **Page 1: Display Employee Profile**:
   - Displays full personal & organizational data (`empid`, name, email, department, designation, member date).
   - Shows detailed salary breakdown calculated dynamically from Q4: Basic Salary, HRA (20%), DA (10%), Deductions (5%), and Monthly Net In-Hand Salary.
4. **Page 2: Application for Leave (Add & List)**:
   - **Add**: Form with `date` picker and `reason` text area.
   - **List**: Comprehensive table listing all leave applications for the logged-in employee with date, reason, applied timestamp, and **Grant Status** (`Yes` / `No` / `Pending`) with color-coded status badges.
   - **Interactive Grant Toggle**: Allows testing/toggling Grant status between `Yes` and `No` live for examiner demonstrations.
5. **Logout**:
   - Clears the JWT token and employee session data from `localStorage` and redirects back to the login screen.

---

## 🚀 How to Run

### Step 1: Install Dependencies

Open two terminals (or run sequentially):

**Terminal 1 (Backend Server):**
```powershell
cd d:\Sem_7\701-fullstack\Asiignment-3\Q5\server
npm install
node server.js
```
*Backend runs at: `http://localhost:5000`*

**Terminal 2 (React Frontend):**
```powershell
cd d:\Sem_7\701-fullstack\Asiignment-3\Q5\client
npm install
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 🔑 Login Testing Credentials

Use any employee record created in **Q4** (from the `erp_system` database). For example:
- **Employee ID**: `EMP1001` (or email: `rudraxatwork@gmail.com`)
- **Password**: Password generated when employee was inserted in Q4 (e.g. `Emp@1832`)
