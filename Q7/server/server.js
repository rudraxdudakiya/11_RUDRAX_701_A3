require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5007;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mern_shopping_cart';

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB (mern_shopping_cart)!');
        try {
            const count = await Category.countDocuments();
            if (count === 0) {
                console.log('Empty database detected. Seeding sample 2-level categories and products...');
                const electronics = await Category.create({ name: 'Electronics', description: 'Gadgets & devices' });
                const fashion = await Category.create({ name: 'Fashion', description: 'Apparel & clothing' });
                const home = await Category.create({ name: 'Home & Kitchen', description: 'Appliances & decor' });

                const laptops = await Category.create({ name: 'Laptops', parent: electronics._id });
                const phones = await Category.create({ name: 'Smartphones', parent: electronics._id });
                const menswear = await Category.create({ name: 'Mens Clothing', parent: fashion._id });
                const womenswear = await Category.create({ name: 'Womens Clothing', parent: fashion._id });
                const appliances = await Category.create({ name: 'Kitchen Appliances', parent: home._id });

                await Product.create([
                    { title: 'MacBook Pro 16', description: 'Apple M3 Max Laptop 36GB RAM', price: 2499, parentCategory: electronics._id, subCategory: laptops._id, stock: 10 },
                    { title: 'iPhone 15 Pro', description: 'Apple 256GB Smartphone', price: 1199, parentCategory: electronics._id, subCategory: phones._id, stock: 25 },
                    { title: 'Cotton T-Shirt', description: 'Classic Blue Cotton Shirt', price: 25, parentCategory: fashion._id, subCategory: menswear._id, stock: 50 },
                    { title: 'Summer Dress', description: 'Lightweight Floral Dress', price: 60, parentCategory: fashion._id, subCategory: womenswear._id, stock: 30 },
                    { title: 'Coffee Maker', description: 'Drip Coffee Brewing Machine', price: 45, parentCategory: home._id, subCategory: appliances._id, stock: 15 }
                ]);
                console.log('Sample data auto-seeded successfully!');
            }
        } catch (seedErr) {
            console.warn('Auto-seed note:', seedErr.message);
        }
    })
    .catch(err => console.error('MongoDB error:', err.message));

// ============================================================
// CATEGORY ROUTES (2-Level Hierarchy)
// ============================================================

// Get ALL categories (with parent info populated)
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().populate('parent', 'name').sort({ createdAt: 1 });
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get only Level 1 (root/parent) categories
app.get('/api/categories/parents', async (req, res) => {
    try {
        const parents = await Category.find({ parent: null }).sort({ name: 1 });
        res.json({ success: true, categories: parents });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get subcategories for a given parent
app.get('/api/categories/:id/subcategories', async (req, res) => {
    try {
        const subs = await Category.find({ parent: req.params.id }).sort({ name: 1 });
        res.json({ success: true, categories: subs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create a Category (Admin)
app.post('/api/categories', async (req, res) => {
    try {
        const { name, description, parent } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });
        const category = new Category({ name, description, parent: parent || null });
        await category.save();
        res.status(201).json({ success: true, message: 'Category created.', category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update a Category (Admin)
app.put('/api/categories/:id', async (req, res) => {
    try {
        const { name, description, parent } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, parent: parent || null },
            { new: true, runValidators: true }
        );
        if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
        res.json({ success: true, message: 'Category updated.', category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete a Category (Admin)
app.delete('/api/categories/:id', async (req, res) => {
    try {
        // Check if any subcategories are using this as parent
        const hasSubs = await Category.findOne({ parent: req.params.id });
        if (hasSubs) return res.status(400).json({ success: false, message: 'Delete all subcategories first.' });
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Category deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================================
// PRODUCT ROUTES
// ============================================================

// Get all products with filters (category, subcategory)
app.get('/api/products', async (req, res) => {
    try {
        const filter = {};
        if (req.query.parentCategory) filter.parentCategory = req.query.parentCategory;
        if (req.query.subCategory) filter.subCategory = req.query.subCategory;

        const products = await Product.find(filter)
            .populate('parentCategory', 'name')
            .populate('subCategory', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: products.length, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get a single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('parentCategory', 'name')
            .populate('subCategory', 'name');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create a Product (Admin)
app.post('/api/products', async (req, res) => {
    try {
        const { title, description, price, parentCategory, subCategory, image, stock } = req.body;
        if (!title || !price || !parentCategory || !subCategory) {
            return res.status(400).json({ success: false, message: 'Title, price, parentCategory, and subCategory are required.' });
        }
        const product = new Product({ title, description, price, parentCategory, subCategory, image, stock });
        await product.save();
        const populated = await product.populate(['parentCategory', 'subCategory']);
        res.status(201).json({ success: true, message: 'Product created.', product: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update a Product (Admin)
app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('parentCategory', 'name')
            .populate('subCategory', 'name');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, message: 'Product updated.', product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete a Product (Admin)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, message: 'Product deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================================
// ORDER ROUTES (User Checkout)
// ============================================================

// Place an order
app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items, subtotal, tax, totalAmount, paymentMethod } = req.body;
        if (!customer || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Customer info and cart items are required.' });
        }
        const order = new Order({ customer, items, subtotal, tax, totalAmount, paymentMethod });
        await order.save();
        res.status(201).json({ success: true, message: 'Order placed successfully!', order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get all orders (Admin)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update order status (Admin)
app.patch('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
        res.json({ success: true, message: `Order status updated to "${status}".`, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'Online', service: 'Q7 Shopping Cart API (MERN)' });
});

app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(` Q7 Shopping Cart API running on port ${PORT}`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(`=============================================`);
});
