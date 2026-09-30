const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No authorization token provided.'
        });
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : authHeader.trim();

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Token is missing.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'erp_employee_jwt_secret_key_2026_super_secure');
        req.user = decoded; // { id, empid, email, name }
        next();
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        });
    }
};

module.exports = authenticateJWT;
