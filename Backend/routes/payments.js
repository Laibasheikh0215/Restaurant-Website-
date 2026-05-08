const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const jwt = require('jsonwebtoken');

// Auth middleware
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Create payment intent
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
    try {
        const { amount, currency = 'usd' } = req.body;
        
        console.log(`💰 Creating payment intent for: $${amount}`);
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency,
            metadata: {
                user_id: req.user.id
            },
        });
        
        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Stripe error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;