const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const path = require('path');

const app = express();

// View engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Redis Client Configuration
const REDIS_URL = 'rediss://default:gQAAAAAABI5FAAIgcDE4YmU1OWVlZWMyNGY0OGM5YWNhMGEzNDU3NWYzZjU0ZA@glad-sheep-298565.upstash.io:6379';

const redisClient = createClient({
    url: (process.env.REDIS_URL && !process.env.REDIS_URL.includes('YOUR_ENDPOINT')) 
        ? process.env.REDIS_URL 
        : REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error:', err.message));
redisClient.on('connect', () => console.log('Connected to Redis server successfully!'));

redisClient.connect().catch((err) => {
    console.warn('Note: Redis connection failed:', err.message);
});

// Redis Session Store Setup
app.use(session({
    store: new RedisStore({ 
        client: redisClient,
        prefix: 'sess:'
    }),
    secret: 'my-redis-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Dummy users for testing
const USERS = [
    { username: 'admin', password: 'admin123', name: 'Administrator', email: 'admin@redis.local', role: 'Admin' },
    { username: 'student', password: 'student123', name: 'Alex Johnson', email: 'student@college.edu', role: 'Student' }
];

// Authentication Middleware to protect routes
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login?error=Please+login+first');
}

// Home route
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

// Login Page (GET)
app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', {
        errorMessage: req.query.error || null,
        successMessage: req.query.success || null,
        username: ''
    });
});

// Login Handler (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.render('login', {
            errorMessage: 'Invalid username or password!',
            successMessage: null,
            username: username || ''
        });
    }

    // Save user info in Redis session
    req.session.user = {
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        loginTime: new Date().toLocaleTimeString()
    };

    res.redirect('/dashboard');
});

// Protected Route 1: Dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', {
        user: req.session.user,
        sessionId: req.sessionID
    });
});

// Protected Route 2: Profile
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', {
        user: req.session.user
    });
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/login?success=Logged+out+successfully');
    });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
