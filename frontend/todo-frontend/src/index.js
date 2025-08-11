import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/service-worker.js')
//       .then(registration => {
//         console.log('Service Worker registered with scope:', registration.scope);
//       })
//       .catch(error => {
//         console.log('Service Worker registration failed:', error);
//       });
//   });
// }

if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => {
      console.log('Service Worker registered:', reg);
      subscribeUserToPush(reg);
    })
    .catch(err => console.error('Service Worker registration failed:', err));
}

const VAPID_PUBLIC_KEY = process.env.REACT_APP_PUBLIC_VAPID_KEY;
const API_URL = 'http://localhost:3000/api/save-subscription'; // Adjust if needed
const JWT_TOKEN = process.env.REACT_APP_JWT_TOKEN

async function subscribeUserToPush(registration) {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    alert('Notification permission denied');
    return;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // Wrap subscription in an object
  const payload = {
    subscription: subscription.toJSON() // ensures it's serializable
  };
console.log('Subscription object:', payload);

  // Send subscription to backend
  await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JWT_TOKEN}`
    },
    body: JSON.stringify(payload),
  });

  console.log('Push subscription sent to server');
}

function urlBase64ToUint8Array(base64String) {
  try {
    if (typeof base64String !== 'string') {
      console.warn('Expected a string but got:', base64String);
      return new Uint8Array(); // Return empty array as fallback
    }

    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  } catch (error) {
    console.error('Failed to convert base64 string to Uint8Array:', error);
    return new Uint8Array(); // Safe fallback
  }
}


// if ('serviceWorker' in navigator && 'PushManager' in window) {
//   navigator.serviceWorker.register('/service-worker.js')
//     .then(reg => {
//       console.log('Service Worker registered:', reg);
//       subscribeUserToPush(reg);
//     })
//     .catch(err => console.error('Service Worker registration failed:', err));
// }
// const VAPID_PUBLIC_KEY = process.env.REACT_APP_PUBLIC_VAPID_KEY;

// async function subscribeUserToPush(registration) {
//   const permission = await Notification.requestPermission();
//   if (permission !== 'granted') {
//     alert('Notification permission denied');
//     return;
//   }

//   const subscription = await registration.pushManager.subscribe({
//     userVisibleOnly: true,
//     applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
//   });

//   // Send subscription to backend
//   await fetch('/api/save-subscription', {
//     method: 'POST',
//     body: JSON.stringify(subscription),
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   console.log('Push subscription sent to server');
// }

// function urlBase64ToUint8Array(base64String) {
//   const padding = '='.repeat((4 - base64String.length % 4) % 4);
//   const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
//   const rawData = window.atob(base64);
//   return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker to enable PWA features
serviceWorkerRegistration.register();