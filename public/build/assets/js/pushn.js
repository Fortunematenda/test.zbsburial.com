/*
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwGgKI26k5xuzfnDetJdDb1caDG1z1vys",
    authDomain: "fortai-7d627.firebaseapp.com",
    projectId: "fortai-7d627",
    storageBucket: "fortai-7d627.appspot.com",
    messagingSenderId: "701202336945",
    appId: "1:701202336945:android:787548d1de86164643a690",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Register service worker and get token
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
            getFCMToken(messaging, registration);
        })
        .catch((error) => {
            console.error("Service Worker registration failed:", error);
        });
}

// Function to get the FCM token
function getFCMToken(messaging, registration) {
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            getToken(messaging, { serviceWorkerRegistration: registration, vapidKey: "BK3Mq1R2BYYvtCovdNN41votnuHAYxB4BnDQMAKOwHd_ZdyLLCNE5sIomukDAW6EZDti5RAPH32xAXLEDRGNOmo" })
                .then((currentToken) => {
                    if (currentToken) {
                        console.log("FCM Device Token:", currentToken);
                        alert(currentToken);
                        // Send this token to your backend
                        */
                        if (window.innerWidth <= 768) { // Adjust the breakpoint as needed for "mobile"
    let _token = $('input[name="_token"]').val(); // CSRF token
    let currentToken = localStorage.getItem('fcmToken');
  

    const obj = {
        token: currentToken,
        _token: _token
    };

    $.ajax({
        url: '/posttoken',
        type: 'POST',
        data: obj, // Send data in one object
        beforeSend: function () {
            // Optional: show loading
        },
        success: function (data) {
            console.log(data);
            console.log("gg");
        },
        error: function (xhr, status, error) {
            console.error('Error:', status, error); // Improved error logging
        },
        complete: function () {
            // Optional: hide loading
        }
    });
}

        
        /*
                    } else {
                        console.warn("No registration token available.");
                        alert("No registration token available.");
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving token:", error);
                    alert("Error retrieving token:"+ error);
                });
        } else {
            console.warn("Notification permission denied.");
            alert("Notification permission denied.");
        }
    });
}

// ✅ Add `onMessage` listener to receive messages when the app is open
onMessage(messaging, (payload) => {
    console.log("Message received in foreground:", payload);
    alert(`New Notification: ${payload.notification.title}`);
});
*/
