const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    empid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    rawPassword: {
        type: String,
        default: ''
    },
    department: {
        type: String,
        default: 'General'
    },
    designation: {
        type: String,
        default: 'Associate'
    },
    basicSalary: {
        type: Number,
        required: true,
        default: 0
    },
    hra: {
        type: Number,
        default: 0
    },
    da: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Use existing 'employees' collection populated in Q4
module.exports = mongoose.model('Employee', employeeSchema);
