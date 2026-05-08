const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./config/database');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');
const { sendConfirmationEmail } = require('./utils/email');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ============ AUTH ROUTES ============

// User registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;
        
        // Check if user exists
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password properly
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role',
            [email, hashedPassword, full_name, phone || '', 'customer']
        );
        
        const token = jwt.sign(
            { id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ success: true, token, user: result.rows[0] });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message });
    }
});

// User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        // Compare password with bcrypt
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ 
            success: true, 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                full_name: user.full_name, 
                role: user.role 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, full_name, phone, role FROM users WHERE id = $1',
            [req.user.id]
        );
        res.json({ user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ MENU ROUTES ============

// Get all menu items
app.get('/api/menu', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM menu_items WHERE is_available = true ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ ADMIN MENU MANAGEMENT ============

// Add menu item
app.post('/api/admin/menu', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, description, price, category, image_url } = req.body;
        
        const result = await pool.query(
            `INSERT INTO menu_items (name, description, price, category, image_url, is_available) 
             VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
            [name, description, price, category, image_url]
        );
        
        res.json({ success: true, item: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update menu item
app.put('/api/admin/menu/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, description, price, category, image_url, is_available } = req.body;
        const id = req.params.id;
        
        const result = await pool.query(
            `UPDATE menu_items 
             SET name = $1, description = $2, price = $3, category = $4, image_url = $5, is_available = $6
             WHERE id = $7 RETURNING *`,
            [name, description, price, category, image_url, is_available, id]
        );
        
        res.json({ success: true, item: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete menu item
app.delete('/api/admin/menu/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ TABLE BOOKING ROUTES ============

// Get available time slots
app.get('/api/table-bookings/available-slots', async (req, res) => {
    try {
        const { date } = req.query;
        
        const result = await pool.query(
            'SELECT booking_time FROM table_bookings WHERE booking_date = $1 AND status = $2',
            [date, 'confirmed']
        );
        
        const bookedTimes = result.rows.map(r => r.booking_time);
        const allTimes = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
        const available = allTimes.filter(time => !bookedTimes.includes(time));
        
        res.json({ available, booked: bookedTimes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create table booking
app.post('/api/table-bookings', authMiddleware, async (req, res) => {
    try {
        const { booking_date, booking_time, party_size, pre_ordered_food, pre_order_total } = req.body;
        
        // Check if already booked
        const existing = await pool.query(
            'SELECT * FROM table_bookings WHERE booking_date = $1 AND booking_time = $2 AND status = $3',
            [booking_date, booking_time, 'confirmed']
        );
        
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'This time slot is already booked' });
        }
        
        const confirmation_code = 'TBL' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        const result = await pool.query(
            `INSERT INTO table_bookings (user_id, booking_date, booking_time, party_size, pre_ordered_food, pre_order_total, confirmation_code, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed') RETURNING *`,
            [req.user.id, booking_date, booking_time, party_size, JSON.stringify(pre_ordered_food || []), pre_order_total || 0, confirmation_code]
        );
        
        // Send email confirmation
        const userResult = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [req.user.id]);
        const user = userResult.rows[0];
        
        const emailHtml = `
            <h1>Table Booking Confirmation</h1>
            <p>Dear ${user.full_name},</p>
            <p>Your table booking has been confirmed!</p>
            <p><strong>Date:</strong> ${booking_date}</p>
            <p><strong>Time:</strong> ${booking_time}</p>
            <p><strong>Party Size:</strong> ${party_size}</p>
            <p><strong>Confirmation Code:</strong> ${confirmation_code}</p>
            <p>Thank you for booking with us!</p>
        `;
        
        await sendConfirmationEmail(user.email, 'Table Booking Confirmation', emailHtml);
        
        res.json({ success: true, booking: result.rows[0] });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user's table bookings
app.get('/api/table-bookings/my-bookings', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM table_bookings WHERE user_id = $1 ORDER BY booking_date DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ EVENT LOCATION ROUTES ============

// Get all event locations
app.get('/api/event-locations', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM event_locations WHERE is_active = true');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check location availability
app.get('/api/event-locations/:id/availability', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT booking_date FROM event_bookings WHERE event_location_id = $1 AND status = $2',
            [req.params.id, 'confirmed']
        );
        res.json({ booked_dates: result.rows.map(r => r.booking_date) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create event booking
app.post('/api/event-bookings', authMiddleware, async (req, res) => {
    try {
        const { event_location_id, booking_date, event_name, number_of_guests, total_amount } = req.body;
        
        // Check if date is available
        const existing = await pool.query(
            'SELECT * FROM event_bookings WHERE event_location_id = $1 AND booking_date = $2 AND status = $3',
            [event_location_id, booking_date, 'confirmed']
        );
        
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'This date is already booked for this location' });
        }
        
        const confirmation_code = 'EVT' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        const result = await pool.query(
            `INSERT INTO event_bookings (user_id, event_location_id, booking_date, event_name, number_of_guests, total_amount, confirmation_code, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed') RETURNING *`,
            [req.user.id, event_location_id, booking_date, event_name, number_of_guests, total_amount, confirmation_code]
        );
        
        // Send email confirmation
        const userResult = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [req.user.id]);
        const locationResult = await pool.query('SELECT name FROM event_locations WHERE id = $1', [event_location_id]);
        
        const emailHtml = `
            <h1>Event Booking Confirmation</h1>
            <p>Dear ${userResult.rows[0].full_name},</p>
            <p>Your event booking has been confirmed!</p>
            <p><strong>Event:</strong> ${event_name || locationResult.rows[0].name}</p>
            <p><strong>Date:</strong> ${booking_date}</p>
            <p><strong>Guests:</strong> ${number_of_guests}</p>
            <p><strong>Total Amount:</strong> $${total_amount}</p>
            <p><strong>Confirmation Code:</strong> ${confirmation_code}</p>
            <p>Thank you for choosing us!</p>
        `;
        
        await sendConfirmationEmail(userResult.rows[0].email, 'Event Booking Confirmation', emailHtml);
        
        res.json({ success: true, booking: result.rows[0] });
    } catch (error) {
        console.error('Event booking error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user's event bookings
app.get('/api/event-bookings/my-bookings', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT eb.*, el.name as location_name 
             FROM event_bookings eb 
             JOIN event_locations el ON eb.event_location_id = el.id 
             WHERE eb.user_id = $1 
             ORDER BY eb.booking_date DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ ORDER ROUTES ============

// Create order
app.post('/api/orders', authMiddleware, async (req, res) => {
    try {
        const { items, total_amount } = req.body;
        
        const orderResult = await pool.query(
            'INSERT INTO orders (user_id, total_amount, status, order_date) VALUES ($1, $2, $3, CURRENT_DATE) RETURNING id',
            [req.user.id, total_amount, 'pending']
        );
        
        const orderId = orderResult.rows[0].id;
        
        for (const item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderId, item.id, item.quantity, item.price]
            );
        }
        
        const userResult = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [req.user.id]);
        
        const emailHtml = `
            <h1>Order Confirmation</h1>
            <p>Dear ${userResult.rows[0].full_name},</p>
            <p>Your order #${orderId} has been placed successfully!</p>
            <p><strong>Total: $${total_amount}</strong></p>
            <p>Thank you for ordering with us!</p>
        `;
        
        await sendConfirmationEmail(userResult.rows[0].email, 'Order Confirmation', emailHtml);
        
        res.json({ success: true, order_id: orderId });
    } catch (error) {
        console.error('Order error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user's orders
app.get('/api/orders/my-orders', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, 
             COALESCE(json_agg(json_build_object('name', mi.name, 'quantity', oi.quantity, 'price', oi.price)) FILTER (WHERE mi.id IS NOT NULL), '[]') as items 
             FROM orders o 
             LEFT JOIN order_items oi ON o.id = oi.order_id 
             LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id 
             WHERE o.user_id = $1 
             GROUP BY o.id 
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ ADMIN ROUTES ============

// Admin stats
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalOrders = await pool.query('SELECT COUNT(*) FROM orders');
        const totalUsers = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['customer']);
        const totalTableBookings = await pool.query('SELECT COUNT(*) FROM table_bookings');
        const totalEventBookings = await pool.query('SELECT COUNT(*) FROM event_bookings');
        
        const recentOrders = await pool.query(
            `SELECT o.*, u.full_name, u.email 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             ORDER BY o.created_at DESC 
             LIMIT 10`
        );
        
        const recentTableBookings = await pool.query(
            `SELECT tb.*, u.full_name, u.email 
             FROM table_bookings tb 
             JOIN users u ON tb.user_id = u.id 
             ORDER BY tb.created_at DESC 
             LIMIT 10`
        );
        
        res.json({
            stats: {
                total_orders: parseInt(totalOrders.rows[0].count),
                total_users: parseInt(totalUsers.rows[0].count),
                total_table_bookings: parseInt(totalTableBookings.rows[0].count),
                total_event_bookings: parseInt(totalEventBookings.rows[0].count)
            },
            recent_orders: recentOrders.rows,
            recent_table_bookings: recentTableBookings.rows,
            recent_event_bookings: []
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin get all orders
app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, u.full_name, u.email 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             ORDER BY o.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin update order status
 // ============ ADMIN: UPDATE ORDER STATUS (FIXED) ============
app.put('/api/admin/orders/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;
        
        console.log(`📝 Updating order ${orderId} to status: ${status}`);
        
        // Check if order exists
        const checkOrder = await pool.query(
            'SELECT * FROM orders WHERE id = $1',
            [orderId]
        );
        
        if (checkOrder.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Update order status
        const result = await pool.query(
            `UPDATE orders 
             SET status = $1, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [status, orderId]
        );
        
        console.log(`✅ Order ${orderId} updated to ${status}`);
        
        // Get user details for email (optional)
        const orderDetails = await pool.query(
            `SELECT o.*, u.email, u.full_name 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.id = $1`,
            [orderId]
        );
        
        const order = orderDetails.rows[0];
        
        // Send email notification (optional)
        const statusMessages = {
            'pending': '⏳ Your order is pending',
            'confirmed': '✅ Your order has been confirmed!',
            'preparing': '🍳 Your order is being prepared',
            'ready': '🎉 Your order is ready!',
            'completed': '✅ Your order is complete',
            'cancelled': '❌ Your order has been cancelled'
        };
        
        try {
            const emailHtml = `
                <h1>Order Status Update</h1>
                <p>Dear ${order.full_name},</p>
                <p>${statusMessages[status] || `Your order status has been updated to: ${status}`}</p>
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>New Status:</strong> ${status}</p>
                <p><strong>Total Amount:</strong> $${order.total_amount}</p>
            `;
            
            await sendConfirmationEmail(order.email, `Order #${orderId} Status Update`, emailHtml);
        } catch (emailError) {
            console.log('Email error (non-critical):', emailError.message);
        }
        
        res.json({ 
            success: true, 
            message: `Order ${status} successfully`,
            order: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ ADMIN: UPDATE TABLE BOOKING STATUS (FIXED) ============
app.put('/api/admin/table-bookings/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;
        
        console.log(`📝 Updating table booking ${bookingId} to status: ${status}`);
        
        const result = await pool.query(
            `UPDATE table_bookings 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [status, bookingId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        console.log(`✅ Table booking ${bookingId} updated to ${status}`);
        
        res.json({ 
            success: true, 
            message: `Booking ${status} successfully` 
        });
        
    } catch (error) {
        console.error('❌ Error updating booking:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ ADMIN: UPDATE EVENT BOOKING STATUS ============
app.put('/api/admin/event-bookings/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;
        
        console.log(`Updating event booking ${bookingId} to status: ${status}`);
        
        const result = await pool.query(
            'UPDATE event_bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, bookingId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event booking not found' });
        }
        
        // Get user email for notification
        const bookingResult = await pool.query(
            `SELECT eb.*, u.email, u.full_name, el.name as location_name
             FROM event_bookings eb 
             JOIN users u ON eb.user_id = u.id 
             JOIN event_locations el ON eb.event_location_id = el.id
             WHERE eb.id = $1`,
            [bookingId]
        );
        
        const booking = bookingResult.rows[0];
        
        const emailHtml = `
            <h1>Event Booking Status Update</h1>
            <p>Dear ${booking.full_name},</p>
            <p>Your event booking has been ${status}!</p>
            <p><strong>Event:</strong> ${booking.event_name || booking.location_name}</p>
            <p><strong>Date:</strong> ${booking.booking_date}</p>
            <p><strong>Guests:</strong> ${booking.number_of_guests}</p>
            <p><strong>Status:</strong> ${status}</p>
        `;
        
        await sendConfirmationEmail(booking.email, `Event Booking #${bookingId} Status Update`, emailHtml);
        
        res.json({ success: true, message: `Event booking ${status} successfully` });
        
    } catch (error) {
        console.error('Error updating event booking status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin add event location
app.post('/api/admin/event-locations', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, address, capacity } = req.body;
        
        const result = await pool.query(
            `INSERT INTO event_locations (name, address, capacity, is_active) 
             VALUES ($1, $2, $3, true) RETURNING *`,
            [name, address, capacity]
        );
        
        res.json({ success: true, location: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin delete event location
app.delete('/api/admin/event-locations/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await pool.query('DELETE FROM event_locations WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ STRIPE PAYMENT ROUTES ============

app.post('/api/payments/create-payment-intent', authMiddleware, async (req, res) => {
    try {
        const { amount, currency = 'usd' } = req.body;
        
        // In demo mode, just return success
        res.json({
            success: true,
            clientSecret: 'demo_secret_' + Date.now()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ CREATE ADMIN USER SCRIPT ============
// Run this once to create admin user

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
});

// ============ ADMIN: GET ALL EVENT BOOKINGS ============
app.get('/api/admin/event-bookings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT eb.*, u.full_name, u.email, el.name as location_name
             FROM event_bookings eb 
             JOIN users u ON eb.user_id = u.id 
             JOIN event_locations el ON eb.event_location_id = el.id
             ORDER BY eb.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching event bookings:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ ADMIN: UPDATE EVENT BOOKING STATUS ============
app.put('/api/admin/event-bookings/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;
        
        const result = await pool.query(
            'UPDATE event_bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, bookingId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event booking not found' });
        }
        
        res.json({ success: true, message: `Event booking ${status} successfully` });
    } catch (error) {
        console.error('Error updating event booking:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ ADMIN: GET ALL TABLE BOOKINGS ============
app.get('/api/admin/table-bookings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT tb.*, u.full_name, u.email 
             FROM table_bookings tb 
             JOIN users u ON tb.user_id = u.id 
             ORDER BY tb.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching table bookings:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ ADMIN: GET ALL ORDERS ============
app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, u.full_name, u.email 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             ORDER BY o.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: error.message });
    }
});