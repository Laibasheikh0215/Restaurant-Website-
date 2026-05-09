const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("./config/database");
const { authMiddleware, adminMiddleware } = require("./middleware/auth");
const { sendConfirmationEmail } = require("./utils/email");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ============ FILE UPLOAD SETUP ============
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

app.use("/uploads", express.static("uploads"));

// Store active connections for socket.io
const userSockets = new Map();

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("register-user", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
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
    io.to(socketId).emit("order-update", {
      orderId,
      status,
      message,
      timestamp: new Date(),
    });
  }
};

// ============ AUTH ROUTES ============

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role",
      [email, hashedPassword, full_name, phone || "", "customer"],
    );

    const token = jwt.sign(
      {
        id: result.rows[0].id,
        email: result.rows[0].email,
        role: result.rows[0].role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ success: true, token, user: result.rows[0] });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, full_name, phone, role FROM users WHERE id = $1",
      [req.user.id],
    );
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ MENU ROUTES ============

app.get("/api/menu", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM menu_items WHERE is_available = true ORDER BY id",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN: MENU MANAGEMENT ============

app.post(
  "/api/admin/menu",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { name, description, price, category, image_url, is_available } =
        req.body;

      const result = await pool.query(
        `INSERT INTO menu_items (name, description, price, category, image_url, is_available) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
        [
          name,
          description,
          price,
          category,
          image_url || null,
          is_available !== false,
        ],
      );

      res.json({ success: true, item: result.rows[0] });
    } catch (error) {
      console.error("Error adding menu item:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

app.put(
  "/api/admin/menu/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id;
      const { name, description, price, category, image_url, is_available } =
        req.body;

      const result = await pool.query(
        `UPDATE menu_items 
             SET name = $1, description = $2, price = $3, category = $4, 
                 image_url = $5, is_available = $6
             WHERE id = $7 
             RETURNING *`,
        [
          name,
          description,
          price,
          category,
          image_url || null,
          is_available,
          id,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      res.json({ success: true, item: result.rows[0] });
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

app.delete(
  "/api/admin/menu/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id;

      const checkOrder = await pool.query(
        "SELECT id FROM order_items WHERE menu_item_id = $1 LIMIT 1",
        [id],
      );

      if (checkOrder.rows.length > 0) {
        await pool.query(
          "UPDATE menu_items SET is_available = false WHERE id = $1",
          [id],
        );
        res.json({
          success: true,
          message: "Menu item marked as unavailable (used in orders)",
        });
      } else {
        await pool.query("DELETE FROM menu_items WHERE id = $1", [id]);
        res.json({ success: true, message: "Menu item deleted successfully" });
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

app.patch(
  "/api/admin/menu/:id/toggle",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id;

      const result = await pool.query(
        `UPDATE menu_items 
             SET is_available = NOT is_available
             WHERE id = $1 
             RETURNING *`,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      res.json({ success: true, item: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============ UPLOAD IMAGE ============

app.post(
  "/api/admin/upload",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        image_url: imageUrl,
        message: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// ============ ORDER ROUTES ============

app.post("/api/orders", authMiddleware, async (req, res) => {
  try {
    const { items, total_amount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }

    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, total_amount, status, order_date) 
             VALUES ($1, $2, 'pending', CURRENT_DATE) 
             RETURNING id`,
      [req.user.id, total_amount],
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price) 
                 VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.quantity, item.price],
      );
    }

    const userResult = await pool.query(
      "SELECT email, full_name FROM users WHERE id = $1",
      [req.user.id],
    );

    const emailHtml = `
            <h1>Order Received</h1>
            <p>Dear ${userResult.rows[0].full_name},</p>
            <p>Your order #${orderId} has been received!</p>
            <p><strong>Total: $${total_amount}</strong></p>
            <p>Thank you for ordering with us!</p>
        `;

    await sendConfirmationEmail(
      userResult.rows[0].email,
      "Order Received",
      emailHtml,
    );

    res.json({ success: true, order_id: orderId });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/orders/my-orders", authMiddleware, async (req, res) => {
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
      [req.user.id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/orders/track/:orderId", authMiddleware, async (req, res) => {
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
      [orderId, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = result.rows[0];

    const statusFlow = {
      pending: { percent: 10, label: "Order Received", icon: "📝" },
      confirmed: { percent: 25, label: "Order Confirmed", icon: "✅" },
      preparing: { percent: 50, label: "Being Prepared", icon: "🍳" },
      ready: { percent: 75, label: "Ready for Pickup", icon: "🎉" },
      completed: { percent: 100, label: "Completed", icon: "🏁" },
      cancelled: { percent: 0, label: "Cancelled", icon: "❌" },
    };

    order.tracking = statusFlow[order.status] || statusFlow.pending;

    res.json(order);
  } catch (error) {
    console.error("Error tracking order:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put(
  "/api/admin/orders/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { status } = req.body;
      const orderId = req.params.id;

      console.log(`📝 Updating order ${orderId} to status: ${status}`);

      const result = await pool.query(
        `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
        [status, orderId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      const orderDetails = await pool.query(
        `SELECT o.*, u.email, u.full_name, u.id as user_id
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.id = $1`,
        [orderId],
      );

      const order = orderDetails.rows[0];

      const statusMessages = {
        pending: "⏳ Your order has been received and is pending confirmation",
        confirmed: "✅ Your order has been confirmed! We are preparing it",
        preparing: "🍳 Your order is being prepared in the kitchen",
        ready: "🎉 Your order is ready! Please pick up from counter",
        completed: "✅ Order completed! Thank you for ordering",
        cancelled: "❌ Your order has been cancelled",
      };

      sendOrderUpdate(
        order.user_id,
        orderId,
        status,
        statusMessages[status] || `Order status updated to: ${status}`,
      );

      const emailHtml = `
            <h1>Order Status Update</h1>
            <p>Dear ${order.full_name},</p>
            <p>${statusMessages[status] || `Your order status has been updated to: ${status}`}</p>
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Total Amount:</strong> $${order.total_amount}</p>
        `;

      await sendConfirmationEmail(
        order.email,
        `Order #${orderId} Status Update`,
        emailHtml,
      );

      res.json({
        success: true,
        message: `Order ${status} successfully`,
        order: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

app.put("/api/orders/:id/confirm", authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.id;
    const result = await pool.query(
      `UPDATE orders SET status = 'confirmed' WHERE id = $1 AND user_id = $2 RETURNING *`,
      [orderId, req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ success: true, message: "Order confirmed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TABLE BOOKING ROUTES ============

app.get("/api/table-bookings/available-slots", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    const result = await pool.query(
      "SELECT booking_time FROM table_bookings WHERE booking_date = $1 AND status IN ($2, $3)",
      [date, "confirmed", "pending"],
    );
    const bookedTimes = result.rows.map((r) => r.booking_time);
    const allTimes = [
      "18:00",
      "18:30",
      "19:00",
      "19:30",
      "20:00",
      "20:30",
      "21:00",
    ];
    const available = allTimes.filter((time) => !bookedTimes.includes(time));
    res.json({ available, booked: bookedTimes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/table-bookings", authMiddleware, async (req, res) => {
  try {
    const {
      booking_date,
      booking_time,
      party_size,
      pre_ordered_food,
      pre_order_total,
    } = req.body;

    const existing = await pool.query(
      "SELECT * FROM table_bookings WHERE booking_date = $1 AND booking_time = $2 AND status IN ($3, $4)",
      [booking_date, booking_time, "confirmed", "pending"],
    );

    if (existing.rows.length >= 10) {
      return res
        .status(400)
        .json({ error: "No tables available for this time slot" });
    }

    const tableNumber = Math.floor(Math.random() * 10) + 1;
    const confirmation_code =
      "TBL" +
      Date.now() +
      Math.random().toString(36).substr(2, 6).toUpperCase();

    const result = await pool.query(
      `INSERT INTO table_bookings (user_id, booking_date, booking_time, party_size, table_number, pre_ordered_food, pre_order_total, confirmation_code, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed') RETURNING *`,
      [
        req.user.id,
        booking_date,
        booking_time,
        party_size,
        tableNumber,
        JSON.stringify(pre_ordered_food || []),
        pre_order_total || 0,
        confirmation_code,
      ],
    );

    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/table-bookings/my-bookings", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM table_bookings WHERE user_id = $1 ORDER BY booking_date DESC",
      [req.user.id],
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/table-bookings/date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const result = await pool.query(
      "SELECT * FROM table_bookings WHERE booking_date = $1 AND status IN ($2, $3)",
      [date, "confirmed", "pending"],
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ EVENT LOCATION ROUTES ============

app.get("/api/event-locations", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM event_locations WHERE is_active = true",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/event-locations/:id/availability", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT booking_date FROM event_bookings WHERE event_location_id = $1 AND status = $2",
      [req.params.id, "confirmed"],
    );
    res.json({ booked_dates: result.rows.map((r) => r.booking_date) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/event-bookings", authMiddleware, async (req, res) => {
  try {
    const {
      event_location_id,
      booking_date,
      event_name,
      number_of_guests,
      total_amount,
    } = req.body;

    const existing = await pool.query(
      "SELECT * FROM event_bookings WHERE event_location_id = $1 AND booking_date = $2 AND status = $3",
      [event_location_id, booking_date, "confirmed"],
    );

    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "This date is already booked for this location" });
    }

    const confirmation_code =
      "EVT" +
      Date.now() +
      Math.random().toString(36).substr(2, 6).toUpperCase();

    const result = await pool.query(
      `INSERT INTO event_bookings (user_id, event_location_id, booking_date, event_name, number_of_guests, total_amount, confirmation_code, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed') RETURNING *`,
      [
        req.user.id,
        event_location_id,
        booking_date,
        event_name,
        number_of_guests,
        total_amount,
        confirmation_code,
      ],
    );

    const userResult = await pool.query(
      "SELECT email, full_name FROM users WHERE id = $1",
      [req.user.id],
    );

    const emailHtml = `
            <h1>Event Booking Confirmation</h1>
            <p>Dear ${userResult.rows[0].full_name},</p>
            <p>Your event booking has been confirmed!</p>
            <p><strong>Event:</strong> ${event_name}</p>
            <p><strong>Date:</strong> ${booking_date}</p>
            <p><strong>Guests:</strong> ${number_of_guests}</p>
            <p><strong>Total Amount:</strong> $${total_amount}</p>
            <p><strong>Confirmation Code:</strong> ${confirmation_code}</p>
        `;

    await sendConfirmationEmail(
      userResult.rows[0].email,
      "Event Booking Confirmation",
      emailHtml,
    );

    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error("Event booking error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/event-bookings/my-bookings", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT eb.*, el.name as location_name 
             FROM event_bookings eb 
             JOIN event_locations el ON eb.event_location_id = el.id 
             WHERE eb.user_id = $1 
             ORDER BY eb.booking_date DESC`,
      [req.user.id],
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/event-bookings/calendar", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const result = await pool.query(
      `SELECT eb.*, el.name as location_name, el.address, el.image_url
             FROM event_bookings eb
             JOIN event_locations el ON eb.event_location_id = el.id
             WHERE eb.booking_date BETWEEN $1 AND $2
             AND eb.status = 'confirmed'
             ORDER BY eb.booking_date`,
      [start_date, end_date],
    );

    const events = result.rows.map((event) => ({
      id: event.id,
      title: `${event.event_name || event.location_name} (${event.number_of_guests} guests)`,
      start: event.booking_date,
      end: event.booking_date,
      location: event.location_name,
      guests: event.number_of_guests,
      total_amount: event.total_amount,
    }));

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN: USER MANAGEMENT ============

app.get(
  "/api/admin/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, email, full_name, phone, role, created_at 
             FROM users 
             WHERE role != 'admin'
             ORDER BY created_at DESC`,
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.put(
  "/api/admin/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { full_name, email, phone, role } = req.body;

      const result = await pool.query(
        `UPDATE users 
             SET full_name = $1, email = $2, phone = $3, role = $4
             WHERE id = $5 AND role != 'admin'
             RETURNING id, email, full_name, phone, role`,
        [full_name, email, phone, role, userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true, user: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.delete(
  "/api/admin/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const userId = req.params.id;

      const ordersCheck = await pool.query(
        "SELECT id FROM orders WHERE user_id = $1 LIMIT 1",
        [userId],
      );

      if (ordersCheck.rows.length > 0) {
        return res
          .status(400)
          .json({
            error: "Cannot delete user with existing orders. Archive instead.",
          });
      }

      const result = await pool.query(
        "DELETE FROM users WHERE id = $1 AND role != $2 RETURNING id",
        [userId, "admin"],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============ ADMIN: REPORTS & ANALYTICS ============
app.get(
  "/api/admin/sales-analytics",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      // Top selling items
      const topItems = await pool.query(`
            SELECT 
                mi.name,
                COUNT(oi.id) as order_count,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.price * oi.quantity) as total_revenue
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'completed'
            GROUP BY mi.id, mi.name
            ORDER BY total_revenue DESC
            LIMIT 10
        `);

      // Revenue by category
      const revenueByCategory = await pool.query(`
            SELECT 
                COALESCE(mi.category, 'Other') as category,
                COUNT(oi.id) as items_sold,
                COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'completed'
            GROUP BY mi.category
            ORDER BY revenue DESC
        `);

      res.json({
        top_items: topItems.rows || [],
        revenue_by_category: revenueByCategory.rows || [],
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.json({
        top_items: [],
        revenue_by_category: [],
      });
    }
  },
);

app.get(
  "/api/admin/orders",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT o.*, u.full_name, u.email 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             ORDER BY o.created_at DESC`,
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.get(
  "/api/admin/table-bookings",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT tb.*, u.full_name, u.email 
             FROM table_bookings tb 
             JOIN users u ON tb.user_id = u.id 
             ORDER BY tb.created_at DESC`,
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.get(
  "/api/admin/event-bookings",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT eb.*, u.full_name, u.email, el.name as location_name
             FROM event_bookings eb 
             JOIN users u ON eb.user_id = u.id 
             JOIN event_locations el ON eb.event_location_id = el.id
             ORDER BY eb.created_at DESC`,
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.get(
  "/api/admin/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const totalOrders = await pool.query("SELECT COUNT(*) FROM orders");
      const totalUsers = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = $1",
        ["customer"],
      );
      const totalTableBookings = await pool.query(
        "SELECT COUNT(*) FROM table_bookings",
      );
      const totalEventBookings = await pool.query(
        "SELECT COUNT(*) FROM event_bookings",
      );

      res.json({
        stats: {
          total_orders: parseInt(totalOrders.rows[0].count),
          total_users: parseInt(totalUsers.rows[0].count),
          total_table_bookings: parseInt(totalTableBookings.rows[0].count),
          total_event_bookings: parseInt(totalEventBookings.rows[0].count),
        },
        recent_orders: [],
        recent_table_bookings: [],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============ EVENT GUESTS MANAGEMENT ============

app.get("/api/event-bookings/:id/guests", authMiddleware, async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS event_guests (
            id SERIAL PRIMARY KEY,
            event_booking_id INTEGER REFERENCES event_bookings(id),
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(20),
            dietary_restrictions TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

    const result = await pool.query(
      "SELECT * FROM event_guests WHERE event_booking_id = $1 ORDER BY name",
      [req.params.id],
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/event-bookings/:id/guests", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, dietary_restrictions } = req.body;
    const result = await pool.query(
      "INSERT INTO event_guests (event_booking_id, name, email, phone, dietary_restrictions) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.params.id, name, email, phone, dietary_restrictions],
    );
    res.json({ success: true, guest: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/event-guests/:id", authMiddleware, async (req, res) => {
  try {
    await pool.query("DELETE FROM event_guests WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Socket.io enabled for real-time updates`);
});

// ============ ADMIN: EVENT LOCATION MANAGEMENT ============

// Add new event location
app.post(
  "/api/admin/event-locations",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { name, address, capacity, description, price_per_person } =
        req.body;

      const result = await pool.query(
        `INSERT INTO event_locations (name, address, capacity, description, price_per_person, is_active) 
             VALUES ($1, $2, $3, $4, $5, true) 
             RETURNING *`,
        [name, address, capacity, description, price_per_person || 25],
      );

      res.json({ success: true, location: result.rows[0] });
    } catch (error) {
      console.error("Error adding location:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Update event location
app.put(
  "/api/admin/event-locations/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id;
      const {
        name,
        address,
        capacity,
        description,
        price_per_person,
        is_active,
      } = req.body;

      const result = await pool.query(
        `UPDATE event_locations 
             SET name = $1, address = $2, capacity = $3, description = $4, 
                 price_per_person = $5, is_active = $6
             WHERE id = $7 
             RETURNING *`,
        [name, address, capacity, description, price_per_person, is_active, id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Location not found" });
      }

      res.json({ success: true, location: result.rows[0] });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete event location
app.delete(
  "/api/admin/event-locations/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id;

      // Check if location has any bookings
      const checkBookings = await pool.query(
        "SELECT id FROM event_bookings WHERE event_location_id = $1 LIMIT 1",
        [id],
      );

      if (checkBookings.rows.length > 0) {
        // Soft delete - just deactivate
        await pool.query(
          "UPDATE event_locations SET is_active = false WHERE id = $1",
          [id],
        );
        res.json({
          success: true,
          message: "Location deactivated (has existing bookings)",
        });
      } else {
        // Hard delete
        await pool.query("DELETE FROM event_locations WHERE id = $1", [id]);
        res.json({ success: true, message: "Location deleted successfully" });
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Get single event location
app.get(
  "/api/admin/event-locations/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id;
      const result = await pool.query(
        "SELECT * FROM event_locations WHERE id = $1",
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Location not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============ ADMIN: CHART DATA FOR DASHBOARD ============
app.get(
  "/api/admin/chart-data",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      // 1. Food Orders by Category
      const foodOrdersByCategory = await pool.query(`
            SELECT 
                mi.category,
                COUNT(oi.id) as order_count,
                SUM(oi.quantity) as total_items
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            JOIN orders o ON oi.order_id = o.id
            GROUP BY mi.category
            ORDER BY order_count DESC
        `);

      // 2. Table Bookings by Party Size
      const tableBookingsBySize = await pool.query(`
            SELECT 
                CASE 
                    WHEN party_size <= 2 THEN '2 Seater'
                    WHEN party_size <= 4 THEN '4 Seater'
                    WHEN party_size <= 6 THEN '6 Seater'
                    ELSE '8+ Seater'
                END as table_type,
                COUNT(*) as booking_count
            FROM table_bookings
            WHERE status = 'confirmed'
            GROUP BY table_type
            ORDER BY booking_count DESC
        `);

      // 3. Event Bookings Distribution
      const eventBookingsByLocation = await pool.query(`
            SELECT 
                el.name as location_name,
                COUNT(eb.id) as booking_count,
                SUM(eb.number_of_guests) as total_guests
            FROM event_bookings eb
            JOIN event_locations el ON eb.event_location_id = el.id
            WHERE eb.status = 'confirmed'
            GROUP BY el.id, el.name
            ORDER BY booking_count DESC
        `);

      res.json({
        food_orders: foodOrdersByCategory.rows,
        table_bookings: tableBookingsBySize.rows,
        event_bookings: eventBookingsByLocation.rows,
      });
    } catch (error) {
      console.error("Chart data error:", error);
      res.status(500).json({ error: error.message });
    }
  },
);
// ============ ADMIN: EXPORT DATA ============
app.get(
  "/api/admin/export/:type",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { type } = req.params;
      let data;
      let filename;
      let headers = [];
      let rows = [];

      switch (type) {
        case "orders":
          const ordersResult = await pool.query(`
                    SELECT o.id, o.total_amount, o.status, o.created_at, u.full_name, u.email
                    FROM orders o
                    JOIN users u ON o.user_id = u.id
                    ORDER BY o.created_at DESC
                `);
          data = ordersResult.rows;
          filename = "orders_export";
          headers = [
            "Order ID",
            "Customer Name",
            "Email",
            "Total Amount",
            "Status",
            "Date",
          ];
          rows = data.map((order) => [
            order.id,
            order.full_name,
            order.email,
            `$${order.total_amount}`,
            order.status,
            new Date(order.created_at).toLocaleString(),
          ]);
          break;

        case "users":
          const usersResult = await pool.query(`
                    SELECT id, email, full_name, phone, role, created_at
                    FROM users
                    WHERE role != 'admin'
                    ORDER BY created_at DESC
                `);
          data = usersResult.rows;
          filename = "users_export";
          headers = [
            "User ID",
            "Name",
            "Email",
            "Phone",
            "Role",
            "Joined Date",
          ];
          rows = data.map((user) => [
            user.id,
            user.full_name,
            user.email,
            user.phone || "-",
            user.role,
            new Date(user.created_at).toLocaleString(),
          ]);
          break;

        case "bookings":
          const bookingsResult = await pool.query(`
                    SELECT tb.id, tb.booking_date, tb.booking_time, tb.party_size, tb.status, u.full_name
                    FROM table_bookings tb
                    JOIN users u ON tb.user_id = u.id
                    ORDER BY tb.created_at DESC
                `);
          data = bookingsResult.rows;
          filename = "bookings_export";
          headers = [
            "Booking ID",
            "Customer Name",
            "Date",
            "Time",
            "Party Size",
            "Status",
          ];
          rows = data.map((booking) => [
            booking.id,
            booking.full_name,
            booking.booking_date,
            booking.booking_time,
            booking.party_size,
            booking.status,
          ]);
          break;

        default:
          return res.status(400).json({ error: "Invalid export type" });
      }

      // Create CSV content
      let csvContent = headers.join(",") + "\n";
      rows.forEach((row) => {
        csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
      });

      // Set response headers for file download
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${filename}_${Date.now()}.csv`,
      );
      res.send(csvContent);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: error.message });
    }
  },
);
