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

// Pre-save hook to calculate salary automatically
employeeSchema.pre('save', function (next) {
    const basic = Number(this.basicSalary) || 0;
    
    // Standard salary calculation if not manually customized:
    // HRA = 20% of basic, DA = 10% of basic, Deductions = 5% of basic
    if (!this.hra) this.hra = Math.round(basic * 0.20);
    if (!this.da) this.da = Math.round(basic * 0.10);
    if (!this.deductions) this.deductions = Math.round(basic * 0.05);

    this.netSalary = Math.round(basic + this.hra + this.da - this.deductions);
    next();
});

module.exports = mongoose.model('Employee', employeeSchema);
