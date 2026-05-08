const bcrypt = require('bcrypt');
const pool = require('./config/database');

async function createAdmin() {
    try {
        // Hash password properly
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Delete old admin if exists
        await pool.query('DELETE FROM users WHERE email = $1', ['admin@restaurant.com']);
        
        // Insert admin user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, full_name, phone, role) 
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, full_name, role`,
            ['admin@restaurant.com', hashedPassword, 'Admin User', '1234567890', 'admin']
        );
        
        console.log('✅ Admin user created successfully!');
        console.log('====================');
        console.log('Email: admin@restaurant.com');
        console.log('Password: admin123');
        console.log('Role: admin');
        console.log('====================');
        console.log('User details:', result.rows[0]);
        
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();