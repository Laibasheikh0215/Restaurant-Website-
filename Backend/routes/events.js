const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const stripe = require('../config/stripe');
const { body, validationResult } = require('express-validator');

// Get all upcoming events
router.get('/upcoming', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, 
             COALESCE(SUM(eb.number_of_guests), 0) as booked_seats
             FROM events e
             LEFT JOIN event_bookings eb ON e.id = eb.event_id AND eb.status = 'confirmed'
             WHERE e.event_date >= CURRENT_DATE AND e.is_active = true
             GROUP BY e.id
             ORDER BY e.event_date ASC`
        );
        
        // Calculate available seats
        const events = result.rows.map(event => ({
            ...event,
            available_seats: event.capacity - parseInt(event.booked_seats),
            booked_seats: parseInt(event.booked_seats)
        }));
        
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Get single event details
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, 
             COALESCE(SUM(eb.number_of_guests), 0) as booked_seats
             FROM events e
             LEFT JOIN event_bookings eb ON e.id = eb.event_id AND eb.status = 'confirmed'
             WHERE e.id = $1
             GROUP BY e.id`,
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        const event = result.rows[0];
        event.available_seats = event.capacity - parseInt(event.booked_seats);
        
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// Book event
router.post('/book/:eventId', authMiddleware, [
    body('number_of_guests').isInt({ min: 1, max: 20 }),
    body('special_requests').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const eventId = req.params.eventId;
        const userId = req.user.id;
        const { number_of_guests, special_requests } = req.body;
        
        // Get event details
        const eventResult = await pool.query(
            'SELECT * FROM events WHERE id = $1 AND is_active = true',
            [eventId]
        );
        
        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        const event = eventResult.rows[0];
        
        // Check available seats
        const bookedSeatsResult = await pool.query(
            `SELECT COALESCE(SUM(number_of_guests), 0) as total 
             FROM event_bookings 
             WHERE event_id = $1 AND status = 'confirmed'`,
            [eventId]
        );
        
        const bookedSeats = parseInt(bookedSeatsResult.rows[0].total);
        const availableSeats = event.capacity - bookedSeats;
        
        if (number_of_guests > availableSeats) {
            return res.status(400).json({ error: `Only ${availableSeats} seats available` });
        }
        
        const totalAmount = number_of_guests * event.price_per_person;
        const bookingReference = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'usd',
            metadata: {
                type: 'event_booking',
                event_id: eventId,
                user_id: userId,
                number_of_guests: number_of_guests
            }
        });
        
        // Create booking record
        const result = await pool.query(
            `INSERT INTO event_bookings 
             (user_id, event_id, number_of_guests, total_amount, special_requests, 
              booking_reference, payment_intent_id, status, payment_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'pending')
             RETURNING *`,
            [userId, eventId, number_of_guests, totalAmount, special_requests, 
             bookingReference, paymentIntent.id]
        );
        
        res.status(201).json({
            success: true,
            booking: result.rows[0],
            clientSecret: paymentIntent.client_secret
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to book event' });
    }
});

// Confirm event booking
router.post('/confirm-booking/:bookingId', authMiddleware, async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const userId = req.user.id;
        
        const bookingResult = await pool.query(
            'SELECT * FROM event_bookings WHERE id = $1 AND user_id = $2',
            [bookingId, userId]
        );
        
        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        const booking = bookingResult.rows[0];
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.payment_intent_id);
        
        if (paymentIntent.status === 'succeeded') {
            await pool.query(
                `UPDATE event_bookings 
                 SET status = 'confirmed', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [bookingId]
            );
            
            // Update event remaining seats
            await pool.query(
                `UPDATE events SET remaining_seats = remaining_seats - $1 WHERE id = $2`,
                [booking.number_of_guests, booking.event_id]
            );
            
            res.json({ 
                success: true, 
                message: 'Booking confirmed successfully',
                bookingReference: booking.booking_reference
            });
        } else {
            res.status(400).json({ error: 'Payment not completed' });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to confirm booking' });
    }
});

// Get user's event bookings
router.get('/my-bookings', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT eb.*, e.name as event_name, e.event_date, e.start_time, e.end_time
             FROM event_bookings eb
             JOIN events e ON eb.event_id = e.id
             WHERE eb.user_id = $1
             ORDER BY e.event_date DESC`,
            [req.user.id]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

module.exports = router;