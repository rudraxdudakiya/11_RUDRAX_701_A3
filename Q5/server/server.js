require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Employee = require('./models/Employee');
const Leave = require('./models/Leave');
const authenticateJWT = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/erp_system';
const JWT_SECRET = process.env.JWT_SECRET || 'erp_employee_jwt_secret_key_2026_super_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB (erp_system) successfully for Employee Portal!'))
    .catch((err) => {
        console.error('MongoDB Connection Error:', err.message);
        console.warn('Ensure MongoDB server is running on 127.0.0.1:27017 or update MONGODB_URI in .env');
    });

// ==========================================
// 1. AUTHENTICATION (JWT LOGIN)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { loginId, password } = req.body;

        if (!loginId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both Employee ID / Email and password.'
            });
        }

        const trimmedId = loginId.trim();

        // Check for Admin login (credentials: admin / admin123)
        if (trimmedId === 'admin' && password === 'admin123') {
            const token = jwt.sign(
                {
                    id: 'admin_id',
                    empid: 'ADMIN',
                    name: 'System Administrator',
                    email: 'admin@erp.com',
                    role: 'admin'
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            return res.json({
                success: true,
                message: 'Admin login successful!',
                token,
                employee: {
                    id: 'admin_id',
                    empid: 'ADMIN',
                    name: 'System Administrator',
                    email: 'admin@erp.com',
                    department: 'Management',
                    designation: 'Admin',
                    role: 'admin'
                }
            });
        }

        // Match either empid (case-insensitive) or email
        const employee = await Employee.findOne({
            $or: [
                { empid: trimmedId },
                { email: trimmedId.toLowerCase() }
            ]
        });

        if (!employee) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Employee not found.'
            });
        }

        // Compare password with bcrypt hash created in Q4
        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password. Please check your credentials.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: employee._id,
                empid: employee.empid,
                name: employee.name,
                email: employee.email,
                role: 'employee'
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Login successful!',
            token,
            employee: {
                id: employee._id,
                empid: employee.empid,
                name: employee.name,
                email: employee.email,
                department: employee.department,
                designation: employee.designation
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during login: ' + err.message
        });
    }
});

// ==========================================
// 2. PAGE 1: DISPLAY EMPLOYEE PROFILE
// ==========================================
app.get('/api/employee/profile', authenticateJWT, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.json({
                success: true,
                profile: {
                    empid: 'ADMIN',
                    name: 'System Administrator',
                    email: 'admin@erp.com',
                    department: 'Management',
                    designation: 'Admin',
                    basicSalary: 80000,
                    hra: 16000,
                    da: 8000,
                    deductions: 4000,
                    netSalary: 100000,
                    createdAt: new Date()
                }
            });
        }

        const employee = await Employee.findById(req.user.id).select('-password');
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee record not found.'
            });
        }

        res.json({
            success: true,
            profile: employee
        });
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile: ' + err.message
        });
    }
});

// ==========================================
// 3. PAGE 2: APPLICATION FOR LEAVE (ADD, LIST, GRANT)
// ==========================================

// Add / Apply for Leave
app.post('/api/leave/apply', authenticateJWT, async (req, res) => {
    try {
        const { date, reason, grant } = req.body;

        if (!date || !reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both leave date and a reason.'
            });
        }

        const employee = await Employee.findById(req.user.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found.'
            });
        }

        const newLeave = new Leave({
            employee: employee._id,
            empid: employee.empid,
            employeeName: employee.name,
            date: date.trim(),
            reason: reason.trim(),
            grant: grant === 'Yes' ? 'Yes' : 'No'
        });

        await newLeave.save();

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully!',
            leave: newLeave
        });
    } catch (err) {
        console.error('Leave apply error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to apply for leave: ' + err.message
        });
    }
});

// List Leaves (Admin sees all employee leaves; employee sees own)
app.get('/api/leave/my-leaves', authenticateJWT, async (req, res) => {
    try {
        let leaves;
        if (req.user.role === 'admin') {
            leaves = await Leave.find().sort({ createdAt: -1 });
        } else {
            leaves = await Leave.find({ employee: req.user.id }).sort({ createdAt: -1 });
        }

        res.json({
            success: true,
            count: leaves.length,
            leaves
        });
    } catch (err) {
        console.error('Leave listing error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave applications: ' + err.message
        });
    }
});

// Toggle / Update Grant status (Only Admin or authorized)
app.patch('/api/leave/:id/grant', authenticateJWT, async (req, res) => {
    try {
        const { grantStatus } = req.body;
        
        let query = { _id: req.params.id };
        if (req.user.role !== 'admin') {
            query.employee = req.user.id;
        }

        const leave = await Leave.findOne(query);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found.'
            });
        }

        if (['Yes', 'No', 'Pending'].includes(grantStatus)) {
            leave.grant = grantStatus;
        } else {
            // Toggle between Yes and No
            leave.grant = leave.grant === 'Yes' ? 'No' : 'Yes';
        }

        await leave.save();

        res.json({
            success: true,
            message: `Leave grant status updated to "${leave.grant}"`,
            leave
        });
    } catch (err) {
        console.error('Grant update error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update leave grant: ' + err.message
        });
    }
});

// Root Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Online', service: 'Q5 ERP Employee Portal API' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Employee Site API Server running on port ${PORT}`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Connected to DB: ${MONGODB_URI}`);
    console.log(`===============================================`);
});
