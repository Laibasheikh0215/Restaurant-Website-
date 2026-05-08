const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const stripe = require('../config/stripe');
const { body, validationResult } = require('express-validator');

// Get available time slots for a date
router.get('/available-slots', async (req, res) => {
    try {
        const { date } = req.query;
        
        const result = await pool.query(
            `SELECT reservation_time, COUNT(*) as bookings 
             FROM table_reservations 
             WHERE reservation_date = $1 AND status IN ('pending', 'confirmed')
             GROUP BY reservation_time`,
            [date]
        );
        
        const timeSlots = {
            '18:00': 20,
            '18:30': 20,
            '19:00': 20,
            '19:30': 20,
            '20:00': 20,
            '20:30': 15,
            '21:00': 15,
            '21:30': 10
        };
        
        const availableSlots = {};
        for (const [time, maxTables] of Object.entries(timeSlots)) {
            const booking = result.rows.find(r => r.reservation_time === time);
            const booked = booking ? parseInt(booking.bookings) : 0;
            availableSlots[time] = {
                available: maxTables - booked,
                max: maxTables
            };
        }
        
        res.json(availableSlots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch available slots' });
    }
});

// Create table reservation
router.post('/create', authMiddleware, [
    body('reservation_date').isDate(),
    body('reservation_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('party_size').isInt({ min: 1, max: 20 }),
    body('customer_name').notEmpty().trim(),
    body('customer_email').isEmail(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { 
            reservation_date, 
            reservation_time, 
            party_size, 
            customer_name, 
            customer_email,
            customer_phone,
            special_requests 
        } = req.body;
        
        const userId = req.user.id;
        
        // Check availability
        const availabilityCheck = await pool.query(
            `SELECT COUNT(*) as booked FROM table_reservations 
             WHERE reservation_date = $1 AND reservation_time = $2 
             AND status IN ('pending', 'confirmed')`,
            [reservation_date, reservation_time]
        );
        
        const bookedCount = parseInt(availabilityCheck.rows[0].booked);
        if (bookedCount >= 20) {
            return res.status(400).json({ error: 'No tables available for this time' });
        }
        
        // Calculate deposit ($5 per person)
        const depositAmount = party_size * 5;
        
        // Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: depositAmount * 100,
            currency: 'usd',
            metadata: {
                type: 'table_reservation',
                user_id: userId,
                party_size: party_size,
                reservation_date: reservation_date,
                reservation_time: reservation_time
            }
        });
        
        // Create reservation
        const result = await pool.query(
            `INSERT INTO table_reservations 
             (user_id, customer_name, customer_email, customer_phone, reservation_date, 
              reservation_time, party_size, special_requests, payment_intent_id, deposit_amount, status, payment_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', 'pending')
             RETURNING *`,
            [userId, customer_name, customer_email, customer_phone, reservation_date,
             reservation_time, party_size, special_requests, paymentIntent.id, depositAmount]
        );
        
        res.status(201).json({
            success: true,
            reservation: result.rows[0],
            clientSecret: paymentIntent.client_secret,
            depositAmount: depositAmount
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

// Confirm reservation
router.post('/confirm/:id', authMiddleware, async (req, res) => {
    try {
        const reservationId = req.params.id;
        const userId = req.user.id;
        
        const reservation = await pool.query(
            'SELECT * FROM table_reservations WHERE id = $1 AND user_id = $2',
            [reservationId, userId]
        );
        
        if (reservation.rows.length === 0) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        
        const paymentIntent = await stripe.paymentIntents.retrieve(
            reservation.rows[0].payment_intent_id
        );
        
        if (paymentIntent.status === 'succeeded') {
            await pool.query(
                `UPDATE table_reservations 
                 SET status = 'confirmed', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [reservationId]
            );
            
            // Assign a table number
            const tableNumber = Math.floor(Math.random() * 20) + 1;
            await pool.query(
                'UPDATE table_reservations SET table_number = $1 WHERE id = $2',
                [tableNumber, reservationId]
            );
            
            res.json({ 
                success: true, 
                message: 'Reservation confirmed successfully',
                tableNumber: tableNumber
            });
        } else {
            res.status(400).json({ error: 'Payment not completed' });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to confirm reservation' });
    }
});

// Get user's reservations
router.get('/my-reservations', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM table_reservations 
             WHERE user_id = $1 
             ORDER BY reservation_date DESC, reservation_time DESC`,
            [req.user.id]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// Cancel reservation
router.delete('/cancel/:id', authMiddleware, async (req, res) => {
    try {
        const reservationId = req.params.id;
        const userId = req.user.id;
        
        const result = await pool.query(
            'UPDATE table_reservations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
            ['cancelled', reservationId, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        
        res.json({ success: true, message: 'Reservation cancelled' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to cancel reservation' });
    }
});

module.exports = router;