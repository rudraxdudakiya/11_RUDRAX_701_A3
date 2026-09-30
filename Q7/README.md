# Question 7: MERN Shopping Cart with Admin & User Sites (2-Level Category & Products)

A complete MERN stack application built with **MongoDB**, **Express**, **React.js**, and **Node.js** with **NO CSS** (pure HTML elements).

---

## 🌟 Key Features

### 1. User Site (Shopping Experience)
- **2-Level Category Filtering**:
  - Filter by **Level 1 (Parent Category)**: e.g. Electronics, Fashion, Home & Kitchen.
  - Dynamically updates **Level 2 (Subcategory)** options based on the chosen parent (e.g. Laptops, Smartphones, Men's Clothing).
  - Clear Filter button to reset back to all products.
- **Product Catalog**:
  - Displays product title, description, price, 2-level category path (Parent > Sub), and stock.
  - **Add to Cart** action.
- **Cart & Checkout**:
  - Real-time cart table with quantity increment (`+`), decrement (`-`), and item removal.
  - Subtotal, 5% tax, and total price calculation.
  - Checkout form: Name, Email, Address, City.
  - Cash on Delivery order placement with instant order confirmation.

### 2. Admin Site (Catalog & Store Management)
- **2-Level Category Management**:
  - **Add Level 1 (Parent) Category**: e.g., create new root departments.
  - **Add Level 2 (Subcategory)**: select a Level 1 parent and assign subcategories under it.
  - View all categories in a hierarchical table with delete support.
- **Product Management**:
  - **Add New Product**: specify Title, Description, Price, Stock, Level 1 Category, and Level 2 Subcategory.
  - View all products in a table with delete support.
- **Customer Orders Management**:
  - View all placed orders with customer details, items purchased, and total amount.
  - Update order status: `Placed`, `Processing`, `Delivered`, `Cancelled`.

---

## 🚀 How to Run

### Step 1: Start the Backend (Port 5007)
```powershell
cd d:\Sem_7\701-fullstack\Assignment-3\Q7\server
npm install
npm start
```
*Backend runs at `http://localhost:5007` and automatically seeds initial 2-level categories and products into MongoDB `mern_shopping_cart` if empty.*

### Step 2: Start the React Frontend (Port 5174)
```powershell
cd d:\Sem_7\701-fullstack\Assignment-3\Q7\client
npm install
npm run dev
```
*Frontend runs at `http://localhost:5174`.*
