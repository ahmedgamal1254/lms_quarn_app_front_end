importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDRJyFVuK5aNRWerZZ8aMAOdBC0YnmYTXU",
  authDomain: "lmsquarn.firebaseapp.com",
  projectId: "lmsquarn",
  storageBucket: "lmsquarn.firebasestorage.app",
  messagingSenderId: "39551623889",
  appId: "1:39551623889:web:fcee64c2b3f1748a249bf0",
  measurementId: "G-SLWSRBVFZZ"
});

const messaging = firebase.messaging();

// Optional: handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
