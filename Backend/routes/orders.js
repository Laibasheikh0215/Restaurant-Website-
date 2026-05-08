const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const stripe = require('../config/stripe');
const { body, validationResult } = require('express-validator');

// Get menu items with 3D models
router.get('/menu', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT mi.*, mc.name as category_name, mc.icon as category_icon
             FROM menu_items mi
             JOIN menu_categories mc ON mi.category_id = mc.id
             WHERE mi.is_available = true
             ORDER BY mc.display_order, mi.id`
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

// Get menu by category
router.get('/menu/category/:categoryId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM menu_items WHERE category_id = $1 AND is_available = true',
            [req.params.categoryId]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch menu items' });
    }
});

// Create order
router.post('/create', authMiddleware, [
    body('items').isArray().notEmpty(),
    body('order_type').isIn(['dine_in', 'takeaway', 'delivery']),
    body('delivery_address').if(body('order_type').equals('delivery')).notEmpty(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { items, order_type, delivery_address, special_instructions, table_reservation_id } = req.body;
        const userId = req.user.id;
        
        // Calculate totals
        let subtotal = 0;
        const orderItems = [];
        
        for (const item of items) {
            const menuResult = await pool.query(
                'SELECT * FROM menu_items WHERE id = $1 AND is_available = true',
                [item.menu_item_id]
            );
            
            if (menuResult.rows.length === 0) {
                return res.status(400).json({ error: `Menu item ${item.menu_item_id} not available` });
            }
            
            const menuItem = menuResult.rows[0];
            const itemSubtotal = menuItem.price * item.quantity;
            subtotal += itemSubtotal;
            
            orderItems.push({
                ...item,
                name: menuItem.name,
                unit_price: menuItem.price,
                subtotal: itemSubtotal
            });
        }
        
        const tax = subtotal * 0.10; // 10% tax
        const delivery_fee = order_type === 'delivery' ? 5.00 : 0;
        const totalAmount = subtotal + tax + delivery_fee;
        
        // Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'usd',
            metadata: {
                type: 'food_order',
                user_id: userId,
                order_type: order_type,
                item_count: items.length
            }
        });
        
        // Create order record
        const orderResult = await pool.query(
            `INSERT INTO orders 
             (user_id, order_type, table_reservation_id, status, subtotal, tax, delivery_fee, 
              total_amount, delivery_address, special_instructions, payment_intent_id, payment_status)
             VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10, 'pending')
             RETURNING *`,
            [userId, order_type, table_reservation_id || null, subtotal, tax, delivery_fee,
             totalAmount, delivery_address, special_instructions, paymentIntent.id]
        );
        
        const order = orderResult.rows[0];
        
        // Create order items
        for (const item of orderItems) {
            await pool.query(
                `INSERT INTO order_items 
                 (order_id, menu_item_id, quantity, unit_price, special_instructions, subtotal)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [order.id, item.menu_item_id, item.quantity, item.unit_price, 
                 item.special_instructions || null, item.subtotal]
            );
        }
        
        res.status(201).json({
            success: true,
            order: order,
            clientSecret: paymentIntent.client_secret,
            items: orderItems
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Confirm order after payment
router.post('/confirm/:orderId', authMiddleware, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const userId = req.user.id;
        
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [orderId, userId]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = orderResult.rows[0];
        const paymentIntent = await stripe.paymentIntents.retrieve(order.payment_intent_id);
        
        if (paymentIntent.status === 'succeeded') {
            const estimatedTime = new Date();
            estimatedTime.setMinutes(estimatedTime.getMinutes() + 45); // 45 min delivery time
            
            await pool.query(
                `UPDATE orders 
                 SET status = 'confirmed', payment_status = 'paid', 
                     estimated_delivery_time = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [estimatedTime, orderId]
            );
            
            res.json({ 
                success: true, 
                message: 'Order confirmed successfully',
                estimatedDeliveryTime: estimatedTime
            });
        } else {
            res.status(400).json({ error: 'Payment not completed' });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to confirm order' });
    }
});

// Get user's order history
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, 
             json_agg(json_build_object(
               'id', oi.id, 
               'menu_item_id', oi.menu_item_id, 
               'quantity', oi.quantity, 
               'unit_price', oi.unit_price,
               'subtotal', oi.subtotal,
               'name', mi.name
             )) as items
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
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get order details
router.get('/:orderId', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, 
             json_agg(json_build_object(
               'id', oi.id, 
               'menu_item_id', oi.menu_item_id, 
               'quantity', oi.quantity, 
               'unit_price', oi.unit_price,
               'subtotal', oi.subtotal,
               'name', mi.name,
               'description', mi.description
             )) as items
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
             WHERE o.id = $1 AND o.user_id = $2
             GROUP BY o.id`,
            [req.params.orderId, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Track order status
router.get('/track/:orderId', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, status, estimated_delivery_time, updated_at FROM orders WHERE id = $1 AND user_id = $2',
            [req.params.orderId, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const statusFlow = {
            'pending': 10,
            'confirmed': 25,
            'preparing': 50,
            'ready': 75,
            'completed': 100,
            'cancelled': 0
        };
        
        const order = result.rows[0];
        order.progress = statusFlow[order.status] || 0;
        
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to track order' });
    }
});

module.exports = router;