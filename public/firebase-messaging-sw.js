/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBcrmkUQLzcuWzPXLFM_aolT_JSmsaTOHQ",
    authDomain: "lofi-41bc7.firebaseapp.com",
    projectId: "lofi-41bc7",
    storageBucket: "lofi-41bc7.firebasestorage.app",
    messagingSenderId: "353182557200",
    appId: "1:353182557200:web:5439ae7a7cfcc36a939695",
    measurementId: "G-LJ97ZLWSNF"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
