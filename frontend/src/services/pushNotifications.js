// Check if browser supports notifications
const isNotificationSupported = () => {
    return 'Notification' in window && 'serviceWorker' in navigator;
};

// Request permission
const requestPermission = async () => {
    if (!isNotificationSupported()) {
        console.log('Notifications not supported');
        return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

// Register service worker
const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return null;
    
    try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered');
        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
    }
};

// Subscribe to push notifications
const subscribeToPush = async () => {
    const registration = await registerServiceWorker();
    if (!registration) return null;
    
    try {
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
        });
        
        // Send subscription to backend
        const response = await fetch('http://localhost:5000/api/notifications/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(subscription)
        });
        
        if (response.ok) {
            console.log('Subscribed to push notifications');
            return subscription;
        }
    } catch (error) {
        console.error('Push subscription error:', error);
    }
    return null;
};

// Helper function
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

// Initialize notifications
const initNotifications = async () => {
    if (!isNotificationSupported()) {
        console.log('Browser does not support notifications');
        return false;
    }
    
    // Check if already granted
    if (Notification.permission === 'granted') {
        await subscribeToPush();
        return true;
    }
    
    // Ask for permission
    const granted = await requestPermission();
    if (granted) {
        await subscribeToPush();
    }
    return granted;
};

// Show local notification (without push service)
const showLocalNotification = (title, body, icon = '/logo192.png') => {
    if (Notification.permission === 'granted') {
        new Notification(title, { body, icon });
    }
};

export {
    initNotifications,
    showLocalNotification,
    requestPermission,
    isNotificationSupported
};