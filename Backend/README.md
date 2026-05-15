# 🍽️ Epicure Hall - Restaurant Management System

A full-featured restaurant management system with table booking, food ordering, event management, real-time order tracking, push notifications, and admin dashboard.

## 📌 Features

### 👤 User Side
- **Authentication**: Email/Password login, Google & Facebook OAuth
- **Menu Browsing**: Search by name/description, category filters, voice search
- **Food Ordering**: Add to cart, checkout, order history
- **Table Booking**: Real-time availability, table layout visualization
- **Event Booking**: Calendar view, guest management
- **Real-time Order Tracking**: Live status updates via Socket.io
- **Profile Management**: Edit profile, change password
- **Push Notifications**: Browser notifications for order updates
- **Multi-language Support**: English, Urdu, Hindi
- **Responsive Design**: Works on desktop, tablet, and mobile

### 👨‍💼 Admin Side
- **Dashboard**: Analytics with pie charts (orders, table bookings, events)
- **Menu Management**: Add/Edit/Delete menu items, image upload, toggle availability
- **Event Location Management**: Add/Edit/Delete venues
- **Booking Management**: View all orders, table bookings, event bookings
- **User Management**: View, edit, delete users
- **Order Status Management**: Update order status with email & push notifications
- **Reports & Export**: Sales analytics, export data to CSV (Orders, Users, Bookings)

## 🛠️ Tech Stack

**Frontend:**
- React.js (v18)
- React Router DOM (v6)
- Axios - API calls
- Socket.io Client - Real-time updates
- Chart.js - Analytics charts
- React Hot Toast - Notifications
- i18next - Multi-language support
- Firebase - Google/Facebook authentication

**Backend:**
- Node.js (v18+)
- Express.js
- PostgreSQL - Database
- Socket.io - Real-time communication
- JWT - Authentication
- bcrypt - Password hashing
- Nodemailer - Email service
- Multer - File upload
- Web-push - Push notifications

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Step 1: Clone the repository
```bash
git clone https://github.com/Laibasheikh0215/epicure-hall.git
cd epicure-hall

STEP 02: SETUP DATABASE
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE restaurant_db;
\q

# Run schema
psql -U postgres -d restaurant_db -f database/schema.sql

STEP 03: Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start

Step 4: Setup Frontend
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm start

Step 5: Create Admin User
cd backend
node create-admin.js

🔧 Environment Variables
Backend (.env)
DB_USER=postgres
DB_HOST=localhost
DB_NAME=restaurant_db
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key

🚀 Running the Application
Development Mode
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start

📁 Project Structure
epicure-hall/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   └── user/
│   │   └── services/
│   └── package.json
└── database/
    └── schema.sql

🔑 Default Admin Credentials
Field	Value
Email	admin@restaurant.com
Password	admin123

📧 Email Configuration (Gmail)
Enable 2-factor authentication on your Gmail account

Generate App Password from Google Account settings

Use that App Password in EMAIL_PASS variable

🔔 Push Notifications Setup
Generate VAPID keys:

bash
cd backend
npm install web-push
node -e "console.log(require('web-push').generateVAPIDKeys())"
Copy the generated keys to your .env file.

🎯 API Endpoints
Auth Routes
Method	Endpoint	Description
POST	/api/auth/register	User registration
POST	/api/auth/login	User login
GET	/api/auth/me	Get current user
PUT	/api/auth/update-profile	Update profile
POST	/api/auth/change-password	Change password
POST	/api/auth/forgot-password	Forgot password
Menu Routes
Method	Endpoint	Description
GET	/api/menu	Get all menu items
POST	/api/admin/menu	Add menu item (admin)
PUT	/api/admin/menu/:id	Update menu item (admin)
DELETE	/api/admin/menu/:id	Delete menu item (admin)
Order Routes
Method	Endpoint	Description
POST	/api/orders	Place order
GET	/api/orders/my-orders	Get user orders
GET	/api/orders/track/:orderId	Track order
PUT	/api/admin/orders/:id/status	Update order status (admin)
Table Booking Routes
Method	Endpoint	Description
GET	/api/table-bookings/available-slots	Get available slots
POST	/api/table-bookings	Create booking
GET	/api/table-bookings/my-bookings	Get user bookings
Event Booking Routes
Method	Endpoint	Description
GET	/api/event-locations	Get event locations
POST	/api/event-bookings	Create event booking
GET	/api/event-bookings/my-bookings	Get user event bookings
🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License.

👨‍💻 Developer
Laiba Sheikh

GitHub: @Laibasheikh0215

🙏 Acknowledgments
Unsplash for images

React community

All contributors

📞 Support
For support, email info@epicurehall.com or create an issue on GitHub.

✅ Features Status
Feature	Status
User Authentication	✅ Complete
Social Login (Google/FB)	✅ Complete
Menu Management	✅ Complete
Cart & Orders	✅ Complete
Table Booking	✅ Complete
Event Booking	✅ Complete
Admin Dashboard	✅ Complete
Real-time Tracking	✅ Complete
Push Notifications	✅ Complete
Multi-language	✅ Complete
Voice Search	✅ Complete
Email Notifications	✅ Complete
Reports Export	✅ Complete
Image Upload	✅ Complete

