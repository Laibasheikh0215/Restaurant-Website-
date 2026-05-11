const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth Header:', authHeader); // Debug
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    // Remove 'Bearer ' prefix
    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted token:', token); // Debug
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied - No token' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded user:', decoded); // Debug
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };