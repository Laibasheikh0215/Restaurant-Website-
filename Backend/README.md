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

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js (v18) | Frontend framework |
| React Router DOM (v6) | Routing |
| Axios | API calls |
| Socket.io Client | Real-time updates |
| Chart.js | Analytics charts |
| React Hot Toast | Notifications |
| i18next | Multi-language support |
| Firebase | Google/Facebook authentication |
| Lodash | Debounce utility |
| React Calendar | Calendar component |
| React Chartjs 2 | Charts |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js (v18+) | Runtime environment |
| Express.js | Backend framework |
| PostgreSQL | Database |
| Socket.io | Real-time communication |
| JWT | Authentication |
| bcrypt | Password hashing |
| Nodemailer | Email service |
| Multer | File upload |
| Web-push | Push notifications |
| Compression | Response compression |
| Dotenv | Environment variables |
| CORS | Cross-origin requests |

## 📦 Dependencies List

### Backend Dependencies (`backend/package.json`)

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "pg": "^8.11.3",
    "socket.io": "^4.6.1",
    "web-push": "^3.6.7"
  }
}

### Frontend Dependencies (`Frontend/package.json`)

```json

{
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/material": "^5.14.18",
    "axios": "^1.6.2",
    "chart.js": "^4.4.1",
    "firebase": "^10.7.0",
    "i18next": "^23.7.6",
    "i18next-browser-languagedetector": "^7.2.0",
    "lodash": "^4.17.21",
    "react": "^18.2.0",
    "react-calendar": "^4.8.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-i18next": "^13.5.0",
    "react-router-dom": "^6.20.1",
    "react-scripts": "5.0.1",
    "socket.io-client": "^4.6.1",
    "web-vitals": "^2.1.4"
  }
}