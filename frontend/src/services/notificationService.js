// Notification Service
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        console.log('Notification permission already granted');
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted');
            return true;
        }
    }
    
    console.log('Notification permission denied');
    return false;
};

export const showNotification = (title, body, icon = '/logo192.png') => {
    if (Notification.permission === 'granted') {
        new Notification(title, { body, icon });
    }
};

export const testNotification = () => {
    showNotification('Gourmet 3D Test', 'Notifications are working! 🎉');
};