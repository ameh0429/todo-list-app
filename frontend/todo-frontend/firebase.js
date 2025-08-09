// // firebase.js
// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";

// const firebaseConfig = {
//   apiKey: "AIzaSyDfIsHKSp6AzECQbxDPIX52izZVam39-78",
//   authDomain: "dtt-project-71a3d.firebaseapp.com",
//   projectId: "dtt-project-71a3d",
//   storageBucket: "dtt-project-71a3d.firebasestorage.app",
//   messagingSenderId: "1058263832864",
//   appId: "1:1058263832864:web:71c06b7ced07ef50e75f45",
// };


// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// export const requestNotificationPermission = async () => {
//   try {
//     const permission = await Notification.requestPermission();
//     if (permission === "granted") {
//       const token = await getToken(messaging, {
//         vapidKey: "BJ5l-15OMY6S-mx-93YJmi2l5tN8FzSVQrNLHinUmz3EkEMd0jSJzOEoLvpTe5lFiw-MMO8gRzAx_sexGX0j1po",
//       });
//       console.log("FCM Token:", token);
//       return token; // Send this token to your backend
//     }
//   } catch (error) {
//     console.error("Permission request failed:", error);
//   }
// };

// export { messaging };
