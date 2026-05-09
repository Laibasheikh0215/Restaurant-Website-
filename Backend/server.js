const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./config/database');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');
const { sendConfirmationEmail } = require('./utils/email');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


//Configure Cloudinary (optional - for production)
// For now, use local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Create uploads folder if not exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}


app.use(cors());
app.use(express.json());

// Store active connections
const userSockets = new Map();

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('register-user', (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        for (let [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                break;
            }
        }
    });
});

// Function to send real-time updates
const sendOrderUpdate = (userId, orderId, status, message) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
        io.to(socketId).emit('order-update', {
            orderId,
            status,
            message,
            timestamp: new Date()
        });
    }
};

// ============ AUTH ROUTES ============

// User registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;
        
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
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

app.get('/api/menu', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM menu_items WHERE is_available = true ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ ORDER ROUTES ============

app.post('/api/orders', authMiddleware, async (req, res) => {
    try {
        const { items, total_amount } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items in order' });
        }
        
        const orderResult = await pool.query(
            `INSERT INTO orders (user_id, total_amount, status, order_date) 
             VALUES ($1, $2, 'pending', CURRENT_DATE) 
             RETURNING id`,
            [req.user.id, total_amount]
        );
        
        const orderId = orderResult.rows[0].id;
        
        for (const item of items) {
            await pool.query(
                `INSERT INTO order_items (order_id, menu_item_id, quantity, price) 
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.id, item.quantity, item.price]
            );
        }
        
        const userResult = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [req.user.id]);
        
        const emailHtml = `
            <h1>Order Received</h1>
            <p>Dear ${userResult.rows[0].full_name},</p>
            <p>Your order #${orderId} has been received!</p>
            <p><strong>Total: $${total_amount}</strong></p>
            <p>Thank you for ordering with us!</p>
        `;
        
        await sendConfirmationEmail(userResult.rows[0].email, 'Order Received', emailHtml);
        
        res.json({ success: true, order_id: orderId });
    } catch (error) {
        console.error('Order error:', error);
        res.status(500).json({ error: error.message });
    }
});

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

// Update order status with real-time notification
app.put('/api/admin/orders/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;
        
        console.log(`📝 Updating order ${orderId} to status: ${status}`);
        
        const result = await pool.query(
            `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
            [status, orderId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const orderDetails = await pool.query(
            `SELECT o.*, u.email, u.full_name, u.id as user_id
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.id = $1`,
            [orderId]
        );
        
        const order = orderDetails.rows[0];
        
        const statusMessages = {
            'pending': '⏳ Your order has been received and is pending confirmation',
            'confirmed': '✅ Your order has been confirmed! We are preparing it',
            'preparing': '🍳 Your order is being prepared in the kitchen',
            'ready': '🎉 Your order is ready! Please pick up from counter',
            'completed': '✅ Order completed! Thank you for ordering',
            'cancelled': '❌ Your order has been cancelled'
        };
        
        sendOrderUpdate(order.user_id, orderId, status, statusMessages[status] || `Order status updated to: ${status}`);
        
        const emailHtml = `
            <h1>Order Status Update</h1>
            <p>Dear ${order.full_name},</p>
            <p>${statusMessages[status] || `Your order status has been updated to: ${status}`}</p>
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Total Amount:</strong> $${order.total_amount}</p>
        `;
        
        await sendConfirmationEmail(order.email, `Order #${orderId} Status Update`, emailHtml);
        
        res.json({ success: true, message: `Order ${status} successfully`, order: result.rows[0] });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get order tracking details
app.get('/api/orders/track/:orderId', authMiddleware, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        
        const result = await pool.query(
            `SELECT o.*, 
             json_agg(json_build_object('name', mi.name, 'quantity', oi.quantity, 'price', oi.price)) as items
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
             WHERE o.id = $1 AND o.user_id = $2
             GROUP BY o.id`,
            [orderId, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = result.rows[0];
        
        const statusFlow = {
            'pending': { percent: 10, label: 'Order Received', icon: '📝' },
            'confirmed': { percent: 25, label: 'Order Confirmed', icon: '✅' },
            'preparing': { percent: 50, label: 'Being Prepared', icon: '🍳' },
            'ready': { percent: 75, label: 'Ready for Pickup', icon: '🎉' },
            'completed': { percent: 100, label: 'Completed', icon: '🏁' },
            'cancelled': { percent: 0, label: 'Cancelled', icon: '❌' }
        };
        
        order.tracking = statusFlow[order.status] || statusFlow.pending;
        
        res.json(order);
    } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ TABLE BOOKING ROUTES ============

app.get('/api/table-bookings/available-slots', async (req, res) => {
    try {
        const { date } = req.query;
        
        // Validate date format
        if (!date || date.includes(':')) {
            return res.status(400).json({ error: 'Invalid date format' });
        }
        
        console.log('Available slots request for date:', date);
        
        const result = await pool.query(
            'SELECT booking_time FROM table_bookings WHERE booking_date = $1 AND status IN ($2, $3)',
            [date, 'confirmed', 'pending']
        );
        
        const bookedTimes = result.rows.map(r => r.booking_time);
        const allTimes = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
        const available = allTimes.filter(time => !bookedTimes.includes(time));
        
        res.json({ available, booked: bookedTimes });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/table-bookings', authMiddleware, async (req, res) => {
    try {
        const { booking_date, booking_time, party_size, pre_ordered_food, pre_order_total } = req.body;
        const existing = await pool.query('SELECT * FROM table_bookings WHERE booking_date = $1 AND booking_time = $2 AND status = $3', [booking_date, booking_time, 'confirmed']);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'This time slot is already booked' });
        }
        const confirmation_code = 'TBL' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
        const result = await pool.query(`INSERT INTO table_bookings (user_id, booking_date, booking_time, party_size, pre_ordered_food, pre_order_total, confirmation_code, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed') RETURNING *`, [req.user.id, booking_date, booking_time, party_size, JSON.stringify(pre_ordered_food || []), pre_order_total || 0, confirmation_code]);
        res.json({ success: true, booking: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/table-bookings/my-bookings', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM table_bookings WHERE user_id = $1 ORDER BY booking_date DESC', [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ EVENT LOCATION ROUTES ============

app.get('/api/event-locations', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM event_locations WHERE is_active = true');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/event-bookings', authMiddleware, async (req, res) => {
    try {
        const { event_location_id, booking_date, event_name, number_of_guests, total_amount } = req.body;
        const confirmation_code = 'EVT' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
        const result = await pool.query(`INSERT INTO event_bookings (user_id, event_location_id, booking_date, event_name, number_of_guests, total_amount, confirmation_code, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed') RETURNING *`, [req.user.id, event_location_id, booking_date, event_name, number_of_guests, total_amount, confirmation_code]);
        res.json({ success: true, booking: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/event-bookings/my-bookings', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`SELECT eb.*, el.name as location_name FROM event_bookings eb JOIN event_locations el ON eb.event_location_id = el.id WHERE eb.user_id = $1 ORDER BY eb.booking_date DESC`, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ ADMIN ROUTES ============

app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`SELECT o.*, u.full_name, u.email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/table-bookings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`SELECT tb.*, u.full_name, u.email FROM table_bookings tb JOIN users u ON tb.user_id = u.id ORDER BY tb.created_at DESC`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/event-bookings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`SELECT eb.*, u.full_name, u.email, el.name as location_name FROM event_bookings eb JOIN users u ON eb.user_id = u.id JOIN event_locations el ON eb.event_location_id = el.id ORDER BY eb.created_at DESC`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalOrders = await pool.query('SELECT COUNT(*) FROM orders');
        const totalUsers = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['customer']);
        const totalTableBookings = await pool.query('SELECT COUNT(*) FROM table_bookings');
        const totalEventBookings = await pool.query('SELECT COUNT(*) FROM event_bookings');
        res.json({
            stats: {
                total_orders: parseInt(totalOrders.rows[0].count),
                total_users: parseInt(totalUsers.rows[0].count),
                total_table_bookings: parseInt(totalTableBookings.rows[0].count),
                total_event_bookings: parseInt(totalEventBookings.rows[0].count)
            },
            recent_orders: [],
            recent_table_bookings: []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Demo payment endpoint
app.put('/api/orders/:id/confirm', authMiddleware, async (req, res) => {
    try {
        const orderId = req.params.id;
        const result = await pool.query(`UPDATE orders SET status = 'confirmed' WHERE id = $1 AND user_id = $2 RETURNING *`, [orderId, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ success: true, message: 'Order confirmed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/payments/create-payment-intent', authMiddleware, async (req, res) => {
    res.json({ success: true, clientSecret: 'demo_secret_' + Date.now() });
});

// Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Socket.io enabled for real-time updates`);
});

// Smart table number assignment
const assignTableNumber = async (party_size, booking_date, booking_time) => {
    // Table configuration
    const tables = [
        { number: 1, capacity: 2, type: 'window' },
        { number: 2, capacity: 2, type: 'window' },
        { number: 3, capacity: 4, type: 'standard' },
        { number: 4, capacity: 4, type: 'standard' },
        { number: 5, capacity: 4, type: 'standard' },
        { number: 6, capacity: 6, type: 'booth' },
        { number: 7, capacity: 6, type: 'booth' },
        { number: 8, capacity: 8, type: 'private' },
        { number: 9, capacity: 8, type: 'private' },
        { number: 10, capacity: 10, type: 'private' }
    ];
    
    // Get already booked tables for this time slot
    const bookedResult = await pool.query(
        'SELECT table_number FROM table_bookings WHERE booking_date = $1 AND booking_time = $2 AND status IN ($3, $4)',
        [booking_date, booking_time, 'confirmed', 'pending']
    );
    
    const bookedTables = bookedResult.rows.map(r => r.table_number);
    
    // Find suitable table
    let assignedTable = null;
    for (const table of tables) {
        if (!bookedTables.includes(table.number) && table.capacity >= party_size) {
            assignedTable = table.number;
            break;
        }
    }
    
    // If no perfect match, find any available table
    if (!assignedTable) {
        for (const table of tables) {
            if (!bookedTables.includes(table.number)) {
                assignedTable = table.number;
                break;
            }
        }
    }
    
    return assignedTable;
};

// Update booking route with automatic table assignment
app.post('/api/table-bookings', authMiddleware, async (req, res) => {
    try {
        const { booking_date, booking_time, party_size, pre_ordered_food, pre_order_total } = req.body;
        
        // Check if already booked
        const existing = await pool.query(
            'SELECT * FROM table_bookings WHERE booking_date = $1 AND booking_time = $2 AND status IN ($3, $4)',
            [booking_date, booking_time, 'confirmed', 'pending']
        );
        
        if (existing.rows.length >= 10) { // Max 10 tables
            return res.status(400).json({ error: 'No tables available for this time slot' });
        }
        
        // Auto assign table number
        const tableNumber = await assignTableNumber(party_size, booking_date, booking_time);
        
        if (!tableNumber) {
            return res.status(400).json({ error: 'No suitable table available for this party size' });
        }
        
        const confirmation_code = 'TBL' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        const result = await pool.query(
            `INSERT INTO table_bookings (user_id, booking_date, booking_time, party_size, table_number, pre_ordered_food, pre_order_total, confirmation_code, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed') RETURNING *`,
            [req.user.id, booking_date, booking_time, party_size, tableNumber, JSON.stringify(pre_ordered_food || []), pre_order_total || 0, confirmation_code]
        );
        
        // Send confirmation with table number
        const userResult = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [req.user.id]);
        
        const emailHtml = `
            <h1>Table Booking Confirmation</h1>
            <p>Dear ${userResult.rows[0].full_name},</p>
            <p>Your table booking has been confirmed!</p>
            <p><strong>Date:</strong> ${booking_date}</p>
            <p><strong>Time:</strong> ${booking_time}</p>
            <p><strong>Party Size:</strong> ${party_size}</p>
            <p><strong>Table Number:</strong> 🪑 ${tableNumber}</p>
            <p><strong>Confirmation Code:</strong> ${confirmation_code}</p>
            <p>Please arrive on time. Your table will be held for 15 minutes.</p>
            <p>Thank you for booking with us!</p>
        `;
        
        await sendConfirmationEmail(userResult.rows[0].email, 'Table Booking Confirmation', emailHtml);
        
        res.json({ success: true, booking: result.rows[0] });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Modify booking route
app.put('/api/table-bookings/:id', authMiddleware, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { booking_date, booking_time, party_size } = req.body;
        
        // Check if booking exists and belongs to user
        const checkResult = await pool.query(
            'SELECT * FROM table_bookings WHERE id = $1 AND user_id = $2',
            [bookingId, req.user.id]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        const currentBooking = checkResult.rows[0];
        
        // Check if new time slot is available
        if (booking_date !== currentBooking.booking_date || booking_time !== currentBooking.booking_time) {
            const existing = await pool.query(
                'SELECT * FROM table_bookings WHERE booking_date = $1 AND booking_time = $2 AND id != $3 AND status IN ($4, $5)',
                [booking_date, booking_time, bookingId, 'confirmed', 'pending']
            );
            
            if (existing.rows.length >= 10) {
                return res.status(400).json({ error: 'No tables available for this time slot' });
            }
            
            // Re-assign table number
            const newTableNumber = await assignTableNumber(party_size, booking_date, booking_time);
            if (!newTableNumber) {
                return res.status(400).json({ error: 'No suitable table available' });
            }
            
            await pool.query(
                'UPDATE table_bookings SET booking_date = $1, booking_time = $2, party_size = $3, table_number = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
                [booking_date, booking_time, party_size, newTableNumber, bookingId]
            );
        } else {
            await pool.query(
                'UPDATE table_bookings SET party_size = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [party_size, bookingId]
            );
        }
        
        res.json({ success: true, message: 'Booking modified successfully' });
    } catch (error) {
        console.error('Modify booking error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cancel booking route
app.delete('/api/table-bookings/:id', authMiddleware, async (req, res) => {
    try {
        const bookingId = req.params.id;
        
        const result = await pool.query(
            'UPDATE table_bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
            ['cancelled', bookingId, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get bookings by date for table layout
app.get('/api/table-bookings/date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const result = await pool.query(
            'SELECT * FROM table_bookings WHERE booking_date = $1 AND status IN ($2, $3)',
            [date, 'confirmed', 'pending']
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});app.post('/api/admin/event-locations', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name, address, capacity, description, price_per_person } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;
        
        const result = await pool.query(
            `INSERT INTO event_locations (name, address, capacity, description, price_per_person, image_url, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
            [name, address, capacity, description, price_per_person, image_url]
        );
        
        res.json({ success: true, location: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get events with bookings count
app.get('/api/event-locations/with-bookings', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT el.*, 
             COUNT(eb.id) as total_bookings,
             SUM(eb.number_of_guests) as total_guests
             FROM event_locations el
             LEFT JOIN event_bookings eb ON el.id = eb.event_location_id AND eb.status = 'confirmed'
             GROUP BY el.id
             ORDER BY el.name`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get events by date range (for calendar)
app.get('/api/event-bookings/calendar', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        const result = await pool.query(
            `SELECT eb.*, el.name as location_name, el.address, el.image_url
             FROM event_bookings eb
             JOIN event_locations el ON eb.event_location_id = el.id
             WHERE eb.booking_date BETWEEN $1 AND $2
             AND eb.status = 'confirmed'
             ORDER BY eb.booking_date`,
            [start_date, end_date]
        );
        
        // Format for calendar
        const events = result.rows.map(event => ({
            id: event.id,
            title: `${event.event_name || event.location_name} (${event.number_of_guests} guests)`,
            start: event.booking_date,
            end: event.booking_date,
            location: event.location_name,
            guests: event.number_of_guests,
            total_amount: event.total_amount
        }));
        
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add guest to event booking
app.post('/api/event-bookings/:id/guests', authMiddleware, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { name, email, phone, dietary_restrictions } = req.body;
        
        // Check if user owns this booking
        const checkResult = await pool.query(
            'SELECT * FROM event_bookings WHERE id = $1 AND user_id = $2',
            [bookingId, req.user.id]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        // Create guest list table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS event_guests (
                id SERIAL PRIMARY KEY,
                event_booking_id INTEGER REFERENCES event_bookings(id),
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                dietary_restrictions TEXT,
                attended BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        const result = await pool.query(
            `INSERT INTO event_guests (event_booking_id, name, email, phone, dietary_restrictions)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [bookingId, name, email, phone, dietary_restrictions]
        );
        
        res.json({ success: true, guest: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all guests for an event
app.get('/api/event-bookings/:id/guests', authMiddleware, async (req, res) => {
    try {
        const bookingId = req.params.id;
        
        // Create table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS event_guests (
                id SERIAL PRIMARY KEY,
                event_booking_id INTEGER REFERENCES event_bookings(id),
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                dietary_restrictions TEXT,
                attended BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        const result = await pool.query(
            'SELECT * FROM event_guests WHERE event_booking_id = $1 ORDER BY name',
            [bookingId]
        );
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete guest from event
app.delete('/api/event-guests/:id', authMiddleware, async (req, res) => {
    try {
        const guestId = req.params.id;
        
        await pool.query('DELETE FROM event_guests WHERE id = $1', [guestId]);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve uploaded images
app.use('/uploads', express.static('uploads'));