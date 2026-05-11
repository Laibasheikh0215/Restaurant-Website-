const webPush = require('web-push');

// VAPID keys (generate once)
const vapidKeys = webPush.generateVAPIDKeys();

// Configure web-push
webPush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY || vapidKeys.publicKey,
    process.env.VAPID_PRIVATE_KEY || vapidKeys.privateKey
);

// Store subscriptions (In production, save to database)
let subscriptions = [];

// Save subscription
const saveSubscription = (userId, subscription) => {
    subscriptions.push({ userId, subscription, createdAt: new Date() });
    console.log(`Subscription saved for user ${userId}`);
};

// Send notification to specific user
const sendNotification = async (userId, title, body, icon = '/logo192.png') => {
    const userSubs = subscriptions.filter(sub => sub.userId === userId);
    
    const payload = JSON.stringify({
        title: title,
        body: body,
        icon: icon,
        badge: '/badge.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/my-bookings',
            timestamp: new Date().getTime()
        }
    });
    
    const notifications = userSubs.map(async (sub) => {
        try {
            await webPush.sendNotification(sub.subscription, payload);
            console.log(`Notification sent to user ${userId}`);
        } catch (error) {
            console.error('Error sending notification:', error);
            // Remove invalid subscription
            if (error.statusCode === 410) {
                subscriptions = subscriptions.filter(s => s !== sub);
            }
        }
    });
    
    await Promise.all(notifications);
};

// Send to all users
const sendNotificationToAll = async (title, body) => {
    const uniqueUsers = [...new Set(subscriptions.map(s => s.userId))];
    for (const userId of uniqueUsers) {
        await sendNotification(userId, title, body);
    }
};

// Get subscriptions for a user
const getUserSubscriptions = (userId) => {
    return subscriptions.filter(sub => sub.userId === userId);
};

module.exports = {
    saveSubscription,
    sendNotification,
    sendNotificationToAll,
    getUserSubscriptions
};