import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No token found. Push subscription will be skipped until user logs in.');
      return;
    }

    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('Service Worker registered:', reg);
        return navigator.serviceWorker.ready;
      })
      .then(swReg => {
        subscribeUserToPush(swReg, token);
      })
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

const VAPID_PUBLIC_KEY = process.env.REACT_APP_PUBLIC_VAPID_KEY;
const API_URL = 'https://todo-list-application.up.railway.app/api/save-subscription';

// Decode base64 (JWT-safe) payload to JSON
function decodeJwtPayload(token) {
  try {
    // Split the JWT into [header, payload, signature]
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payloadPart = parts[1];
    if (!payloadPart) return null;

    // Convert base64url → base64
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if missing
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

    // Decode & parse JSON
    const json = atob(padded);
    return JSON.parse(json);
  } catch (err) {
    console.error('Failed to decode JWT payload:', err);
    return null;
  }
}

function getUserIdFromToken(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  // Support common claim names
  return payload.userId || payload._id || payload.id || payload.sub || null;
}


function urlBase64ToUint8Array(base64String) {
  try {
    if (typeof base64String !== 'string') {
      console.warn('Expected a string but got:', base64String);
      return new Uint8Array();
    }

    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  } catch (error) {
    console.error('Failed to convert base64 string to Uint8Array:', error);
    return new Uint8Array();
  }
}

export async function subscribeUserToPush(registration, token) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Notification permission denied');
      return;
    }

    if (!VAPID_PUBLIC_KEY || typeof VAPID_PUBLIC_KEY !== 'string') {
      console.error('Invalid VAPID public key:', VAPID_PUBLIC_KEY);
      return;
    }

    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    // Unsubscribe if an old subscription exists
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe();
      console.log('Unsubscribed from previous push subscription');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    const userId = getUserIdFromToken(token);
    if (!userId) {
      console.warn('Could not extract userId from token. Backend should fall back to Authorization header.');
    }



    // const payload = { subscription: subscription.toJSON() };

     const payload = {
      userId, // send when available so backend can link to user
      subscription: subscription.toJSON()
    };

    console.log('Subscription object:', payload);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    console.log('Push subscription sent to server');
  } catch (error) {
    console.error('Push subscription failed:', error);
    alert('Failed to subscribe to notifications. See console for details.');
  }
}





// from here
// if ('serviceWorker' in navigator && 'PushManager' in window) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js')
//       .then(reg => {
//         console.log('Service Worker registered:', reg);
//         // Wait until the service worker is ready
//         navigator.serviceWorker.ready.then(swReg => {
//           subscribeUserToPush(swReg);
//         });
//       })
//       .catch(err => console.error('Service Worker registration failed:', err));
//   });
// }

// const VAPID_PUBLIC_KEY = process.env.REACT_APP_PUBLIC_VAPID_KEY;
// const API_URL = 'https://todo-list-application.up.railway.app/api/save-subscription'; 
// // const JWT_TOKEN = process.env.REACT_APP_JWT_TOKEN;

// function urlBase64ToUint8Array(base64String) {
//   try {
//     if (typeof base64String !== 'string') {
//       console.warn('Expected a string but got:', base64String);
//       return new Uint8Array();
//     }

//     const padding = '='.repeat((4 - base64String.length % 4) % 4);
//     const base64 = (base64String + padding)
//       .replace(/-/g, '+')
//       .replace(/_/g, '/');

//     const rawData = window.atob(base64);
//     return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
//   } catch (error) {
//     console.error('Failed to convert base64 string to Uint8Array:', error);
//     return new Uint8Array();
//   }
// }

// async function subscribeUserToPush(registration) {
//   try {
//     const permission = await Notification.requestPermission();
//     if (permission !== 'granted') {
//       alert('Notification permission denied');
//       return;
//     }

//     if (!VAPID_PUBLIC_KEY || typeof VAPID_PUBLIC_KEY !== 'string') {
//       console.error('Invalid VAPID public key:', VAPID_PUBLIC_KEY);
//       return;
//     }

//     const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

//     // Unsubscribe if an old subscription exists
//     const existingSubscription = await registration.pushManager.getSubscription();
//     if (existingSubscription) {
//       await existingSubscription.unsubscribe();
//       console.log('Unsubscribed from previous push subscription');
//     }

//     const subscription = await registration.pushManager.subscribe({
//       userVisibleOnly: true,
//       applicationServerKey
//     });

//     const payload = {
//       subscription: subscription.toJSON()
//     };

//     console.log('Subscription object:', payload);

//     const token = localStorage.getItem('token');
//     const response = await fetch(API_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error(`Server responded with ${response.status}`);
//     }

//     console.log('Push subscription sent to server');
//   } catch (error) {
//     console.error('Push subscription failed:', error);
//     alert('Failed to subscribe to notifications. See console for details.');
//   }
// }


// if ('serviceWorker' in navigator && 'PushManager' in window) {
//   navigator.serviceWorker.register('/service-worker.js')
//     .then(reg => {
//       console.log('Service Worker registered:', reg);
//       subscribeUserToPush(reg);
//     })
//     .catch(err => console.error('Service Worker registration failed:', err));
// }


// const VAPID_PUBLIC_KEY = process.env.REACT_APP_PUBLIC_VAPID_KEY;
// const API_URL = 'https://todo-list-application.up.railway.app/api/save-subscription'; 
// const JWT_TOKEN = process.env.REACT_APP_JWT_TOKEN;

// function urlBase64ToUint8Array(base64String) {
//   try {
//     if (typeof base64String !== 'string') {
//       console.warn('Expected a string but got:', base64String);
//       return new Uint8Array();
//     }

//     const padding = '='.repeat((4 - base64String.length % 4) % 4);
//     const base64 = (base64String + padding)
//       .replace(/-/g, '+')
//       .replace(/_/g, '/');

//     const rawData = window.atob(base64);
//     return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
//   } catch (error) {
//     console.error('Failed to convert base64 string to Uint8Array:', error);
//     return new Uint8Array();
//   }
// }

// async function subscribeUserToPush(registration) {
//   try {
//     const permission = await Notification.requestPermission();
//     if (permission !== 'granted') {
//       alert('Notification permission denied');
//       return;
//     }

//     if (!VAPID_PUBLIC_KEY || typeof VAPID_PUBLIC_KEY !== 'string') {
//       console.error('Invalid VAPID public key:', VAPID_PUBLIC_KEY);
//       return;
//     }

//     const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

//     const subscription = await registration.pushManager.subscribe({
//       userVisibleOnly: true,
//       applicationServerKey
//     });

//     const payload = {
//       subscription: subscription.toJSON()
//     };

//     console.log('Subscription object:', payload);

//     const response = await fetch(API_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${JWT_TOKEN}`
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error(`Server responded with ${response.status}`);
//     }

//     console.log('Push subscription sent to server');
//   } catch (error) {
//     console.error('Push subscription failed:', error);
//     alert('Failed to subscribe to notifications. See console for details.');
//   }
// }

// const VAPID_PUBLIC_KEY = process.env.REACT_APP_PUBLIC_VAPID_KEY;
// const API_URL = 'http://localhost:3000/api/save-subscription'; 
// const JWT_TOKEN = process.env.REACT_APP_JWT_TOKEN

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

//   // Wrap subscription in an object
//   const payload = {
//     subscription: subscription.toJSON() // ensures it's serializable
//   };
// console.log('Subscription object:', payload);

//   // Send subscription to backend
//   await fetch(API_URL, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${JWT_TOKEN}`
//     },
//     body: JSON.stringify(payload),
//   });

//   console.log('Push subscription sent to server');
// }

// function urlBase64ToUint8Array(base64String) {
//   try {
//     if (typeof base64String !== 'string') {
//       console.warn('Expected a string but got:', base64String);
//       return new Uint8Array(); // Return empty array as fallback
//     }

//     const padding = '='.repeat((4 - base64String.length % 4) % 4);
//     const base64 = (base64String + padding)
//       .replace(/-/g, '+')
//       .replace(/_/g, '/');

//     const rawData = window.atob(base64);
//     return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
//   } catch (error) {
//     console.error('Failed to convert base64 string to Uint8Array:', error);
//     return new Uint8Array(); // Safe fallback
//   }
// }


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
// To here

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker to enable PWA features
serviceWorkerRegistration.register();