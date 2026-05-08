-- Drop existing tables
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS table_bookings CASCADE;
DROP TABLE IF EXISTS event_bookings CASCADE;
DROP TABLE IF EXISTS event_locations CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    order_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Table bookings
CREATE TABLE table_bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    table_number INTEGER,
    pre_ordered_food TEXT,
    pre_order_total DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    confirmation_code VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event locations
CREATE TABLE event_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    capacity INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event bookings
CREATE TABLE event_bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_location_id INTEGER REFERENCES event_locations(id),
    booking_date DATE NOT NULL,
    event_name VARCHAR(200),
    number_of_guests INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    confirmation_code VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category) VALUES
('Margherita Pizza', 'Fresh mozzarella, tomato sauce, basil', 12.99, 'Pizza'),
('Pepperoni Pizza', 'Pepperoni, mozzarella, tomato sauce', 14.99, 'Pizza'),
('Caesar Salad', 'Romaine lettuce, croutons, parmesan', 8.99, 'Salads'),
('Classic Burger', 'Beef patty, lettuce, tomato, cheese', 10.99, 'Burgers'),
('Pasta Alfredo', 'Creamy alfredo sauce, parmesan', 13.99, 'Pasta'),
('Chocolate Cake', 'Rich chocolate cake with ganache', 6.99, 'Desserts'),
('Coca Cola', 'Refreshing soft drink', 2.99, 'Beverages');

-- Insert event locations
INSERT INTO event_locations (name, address, capacity) VALUES
('Main Hall', '123 Main Street, Downtown', 100),
('Garden Terrace', '456 Garden Avenue, Westside', 50),
('VIP Lounge', '789 Luxury Boulevard, Eastside', 30);