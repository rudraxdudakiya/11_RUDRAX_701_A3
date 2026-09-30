const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');
const Product = require('./models/Product');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mern_shopping_cart');
        console.log('Connected to MongoDB. Purging old data...');

        await Category.deleteMany({});
        await Product.deleteMany({});

        // --- Create Level 1 (Parent) Categories ---
        const electronics = await Category.create({ name: 'Electronics' });
        const fashion = await Category.create({ name: 'Fashion' });
        const home = await Category.create({ name: 'Home & Kitchen' });

        // --- Create Level 2 (Sub) Categories ---
        const laptops = await Category.create({ name: 'Laptops', parent: electronics._id });
        const phones = await Category.create({ name: 'Smartphones', parent: electronics._id });
        const audio = await Category.create({ name: 'Audio & Headphones', parent: electronics._id });

        const menswear = await Category.create({ name: 'Men\'s Clothing', parent: fashion._id });
        const womenswear = await Category.create({ name: 'Women\'s Clothing', parent: fashion._id });
        
        const decor = await Category.create({ name: 'Home Decor', parent: home._id });
        const appliances = await Category.create({ name: 'Kitchen Appliances', parent: home._id });

        // --- Create Products ---
        const products = [
            {
                title: 'MacBook Pro 16" M3 Max',
                description: 'The ultimate pro laptop. Space Black, 36GB RAM, 1TB SSD.',
                price: 2499.00,
                parentCategory: electronics._id,
                subCategory: laptops._id,
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
                stock: 12
            },
            {
                title: 'iPhone 15 Pro Max',
                description: 'Titanium design, A17 Pro chip, Action button. 256GB.',
                price: 1199.00,
                parentCategory: electronics._id,
                subCategory: phones._id,
                image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop',
                stock: 25
            },
            {
                title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
                description: 'Industry-leading noise cancellation, 30-hour battery life.',
                price: 348.00,
                parentCategory: electronics._id,
                subCategory: audio._id,
                image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&auto=format&fit=crop',
                stock: 40
            },
            {
                title: 'Premium Cotton Blend T-Shirt',
                description: 'Classic fit, breathable cotton blend. Navy Blue.',
                price: 24.99,
                parentCategory: fashion._id,
                subCategory: menswear._id,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop',
                stock: 100
            },
            {
                title: 'Elegant Floral Summer Dress',
                description: 'Lightweight, floral print, perfect for summer outings.',
                price: 59.99,
                parentCategory: fashion._id,
                subCategory: womenswear._id,
                image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop',
                stock: 35
            },
            {
                title: 'Ceramic Pour-Over Coffee Maker',
                description: 'Minimalist design, brews perfect coffee every time.',
                price: 45.00,
                parentCategory: home._id,
                subCategory: appliances._id,
                image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop',
                stock: 18
            },
            {
                title: 'Modern Geometric Area Rug',
                description: 'Soft, durable, 5x7 ft. Geometric pattern.',
                price: 120.00,
                parentCategory: home._id,
                subCategory: decor._id,
                image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop',
                stock: 8
            }
        ];

        await Product.insertMany(products);

        console.log('Database seeded successfully with 2-level categories and products!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
