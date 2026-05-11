self.addEventListener('push', function(event) {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: data.icon || '/logo192.png',
        badge: '/badge.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.data?.url || '/my-bookings',
            timestamp: data.data?.timestamp || Date.now()
        },
        actions: [
            {
                action: 'view',
                title: 'View Details'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'view') {
        const url = event.notification.data?.url || '/';
        event.waitUntil(
            clients.openWindow(url)
        );
    } else {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(function(clientList) {
                if (clientList.length > 0) {
                    clientList[0].focus();
                } else {
                    clients.openWindow('/');
                }
            })
        );
    }
});

self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(clients.claim());
});