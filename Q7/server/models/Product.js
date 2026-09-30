const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: 0
    },
    // Level 1 Category (Parent, e.g. Electronics)
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Parent category is required']
    },
    // Level 2 Category (Subcategory, e.g. Laptops)
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Subcategory is required']
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
    },
    stock: {
        type: Number,
        default: 15,
        min: 0
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
