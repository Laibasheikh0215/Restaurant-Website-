const Stripe = require('stripe');
require('dotenv').config();

// Check if Stripe key exists
if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY is not set. Payment features disabled.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

module.exports = stripe;