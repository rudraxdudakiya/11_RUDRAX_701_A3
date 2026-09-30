require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');

const Employee = require('./models/Employee');

const app = express();

// View Engine & Static Files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'erp_secret_session_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4 hours
}));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_system';
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB successfully!');
        try {
            const withoutRaw = await Employee.find({
                $or: [{ rawPassword: { $exists: false } }, { rawPassword: '' }, { rawPassword: null }]
            });
            for (const emp of withoutRaw) {
                const raw = 'Emp@' + Math.floor(1000 + Math.random() * 9000);
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(raw, salt);
                await Employee.updateOne(
                    { _id: emp._id },
                    { $set: { rawPassword: raw, password: hashedPassword } }
                );
                console.log(`Set generated password for ${emp.empid}: ${raw}`);
            }
        } catch (e) {
            console.warn('Initial password check note:', e.message);
        }
    })
    .catch((err) => {
        console.warn('Note: MongoDB connection not established yet.');
        console.warn('Please start MongoDB Compass or check your connection string in .env');
    });

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    }
});

// Helper function to send email to newly inserted employee
async function sendWelcomeEmail(employee, rawPassword) {
    const mailOptions = {
        from: '"ERP Admin System" <admin@erp.com>',
        to: employee.email,
        subject: 'Welcome to the Company - Your ERP Login Credentials',
        html: `
            <h2>Welcome, ${employee.name}!</h2>
            <p>You have been registered in the ERP system. Here are your account details:</p>
            <ul>
                <li><strong>Employee ID:</strong> ${employee.empid}</li>
                <li><strong>Email:</strong> ${employee.email}</li>
                <li><strong>Initial Password:</strong> <code>${rawPassword}</code></li>
                <li><strong>Department:</strong> ${employee.department}</li>
                <li><strong>Designation:</strong> ${employee.designation}</li>
                <li><strong>Calculated Net Salary:</strong> ₹${employee.netSalary.toLocaleString()}</li>
            </ul>
            <p>Please log in and change your password upon first login.</p>
        `
    };

    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
            await transporter.sendMail(mailOptions);
            console.log(`Email successfully sent to: ${employee.email}`);
        } else {
            console.log('\n--- [EMAIL SIMULATION: Credentials Sent to Employee] ---');
            console.log(`To: ${employee.email}`);
            console.log(`EmpID: ${employee.empid} | Generated Password: ${rawPassword}`);
            console.log(`Net Salary: ₹${employee.netSalary}`);
            console.log('-------------------------------------------------------\n');
        }
    } catch (err) {
        console.warn(`Email could not be delivered to ${employee.email}:`, err.message);
    }
}

// Authentication Middleware
function isAdminAuthenticated(req, res, next) {
    if (req.session && req.session.admin) {
        return next();
    }
    res.redirect('/login?error=Please+login+as+admin+to+access+ERP');
}

// Routes

// Home redirect
app.get('/', (req, res) => {
    if (req.session && req.session.admin) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

// Admin Login (GET)
app.get('/login', (req, res) => {
    if (req.session && req.session.admin) {
        return res.redirect('/dashboard');
    }
    res.render('login', {
        errorMessage: req.query.error || null,
        successMessage: req.query.success || null
    });
});

// Admin Login (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Hardcoded Admin credentials for ERP
    if (username === 'admin' && password === 'admin123') {
        req.session.admin = { username: 'admin' };
        return res.redirect('/dashboard');
    }

    res.render('login', {
        errorMessage: 'Invalid Admin username or password!',
        successMessage: null
    });
});

// Admin Dashboard - Read / List Employees (Protected)
app.get('/dashboard', isAdminAuthenticated, async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });

        // Ensure every employee displayed has rawPassword populated in DB
        for (const emp of employees) {
            if (!emp.rawPassword) {
                const raw = 'Emp@' + Math.floor(1000 + Math.random() * 9000);
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(raw, salt);
                await Employee.updateOne(
                    { _id: emp._id },
                    { $set: { rawPassword: raw, password: hashedPassword } }
                );
                emp.rawPassword = raw;
            }
        }

        res.render('dashboard', {
            adminUser: req.session.admin.username,
            employees: employees,
            errorMessage: req.query.error || null,
            successMessage: req.query.success || null
        });
    } catch (err) {
        res.render('dashboard', {
            adminUser: req.session.admin.username,
            employees: [],
            errorMessage: 'Error loading employees: ' + err.message,
            successMessage: null
        });
    }
});

// Add Employee Form (GET)
app.get('/employees/add', isAdminAuthenticated, (req, res) => {
    res.render('add-employee', {
        errorMessage: null
    });
});

// Create Employee Handler (POST)
app.post('/employees/add', isAdminAuthenticated, async (req, res) => {
    const { name, email, department, designation, basicSalary } = req.body;

    try {
        // 1. Generate unique empid (e.g. EMP1001, EMP1002...)
        const count = await Employee.countDocuments();
        const empid = `EMP${1001 + count}`;

        // 2. Generate random initial password (e.g. Emp@4829)
        const rawPassword = 'Emp@' + Math.floor(1000 + Math.random() * 9000);

        // 3. Encrypt the password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        // 4. Calculate Salary
        const basic = Number(basicSalary) || 0;
        const hra = Math.round(basic * 0.20);        // 20% HRA
        const da = Math.round(basic * 0.10);         // 10% DA
        const deductions = Math.round(basic * 0.05); // 5% Deductions (PF/Tax)
        const netSalary = Math.round(basic + hra + da - deductions);

        // 5. Create employee record in MongoDB
        const newEmployee = new Employee({
            empid,
            name,
            email,
            password: hashedPassword,
            rawPassword,
            department,
            designation,
            basicSalary: basic,
            hra,
            da,
            deductions,
            netSalary
        });

        await newEmployee.save();

        // 6. Send email notification to employee with generated credentials
        await sendWelcomeEmail(newEmployee, rawPassword);

        res.redirect('/dashboard?success=' + encodeURIComponent(`Employee ${empid} added successfully! Credentials emailed.`));
    } catch (err) {
        console.error('Create Employee Error:', err);
        res.render('add-employee', {
            errorMessage: 'Failed to create employee: ' + err.message
        });
    }
});

// Edit Employee Form (GET)
app.get('/employees/edit/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.redirect('/dashboard?error=Employee+not+found');
        }
        res.render('edit-employee', {
            employee,
            errorMessage: null
        });
    } catch (err) {
        res.redirect('/dashboard?error=' + encodeURIComponent(err.message));
    }
});

// Update Employee Handler (POST)
app.post('/employees/edit/:id', isAdminAuthenticated, async (req, res) => {
    const { name, email, department, designation, basicSalary } = req.body;

    try {
        const basic = Number(basicSalary) || 0;
        const hra = Math.round(basic * 0.20);
        const da = Math.round(basic * 0.10);
        const deductions = Math.round(basic * 0.05);
        const netSalary = Math.round(basic + hra + da - deductions);

        await Employee.findByIdAndUpdate(req.params.id, {
            name,
            email,
            department,
            designation,
            basicSalary: basic,
            hra,
            da,
            deductions,
            netSalary
        });

        res.redirect('/dashboard?success=Employee+updated+successfully');
    } catch (err) {
        res.redirect('/dashboard?error=' + encodeURIComponent(err.message));
    }
});

// Delete Employee Handler (POST)
app.post('/employees/delete/:id', isAdminAuthenticated, async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard?success=Employee+deleted+successfully');
    } catch (err) {
        res.redirect('/dashboard?error=' + encodeURIComponent(err.message));
    }
});

// Admin Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/login?success=Admin+logged+out+successfully');
    });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`ERP Admin Panel running at http://localhost:${PORT}`);
});
