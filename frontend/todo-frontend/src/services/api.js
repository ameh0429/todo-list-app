import { subscribeUserToPush } from '../index.js';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://todo-list-application.up.railway.app/api" ||
  "http://localhost:3000";

export const api = {
  // login: async (email, password) => {
  //   const response = await fetch(`${API_BASE_URL}/login`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, password }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.token) {
  //         localStorage.setItem('token', data.token);
  //       }
  //     });
  //   return await response.json();
  // },

  // login: async (email, password) => {
  //   try {
  //     const res = await fetch(`${API_BASE_URL}/login`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const data = await res.json();

  //     if (data.data.token) {
  //       // Store token
  //       localStorage.setItem('token', data.data.token);
  //       console.log("Token saved:", data.data.token);

  //       // Immediately trigger push subscription
  //       if ('serviceWorker' in navigator && 'PushManager' in window) {
  //         navigator.serviceWorker.ready.then(swReg => {
  //           subscribeUserToPush(swReg, data.token);
  //         });
  //       }
  //     }

  //     return data;
  //   } catch (error) {
  //     console.error("Login failed:", error);
  //     throw error;
  //   }
  // },
 
  login: async (email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data?.data?.token) {
      const token = data.data.token;

      // Store token
      localStorage.setItem("token", token);
      console.log("Token saved:", token);

      // Immediately trigger push subscription
      if ("serviceWorker" in navigator && "PushManager" in window) {
        navigator.serviceWorker.ready.then(swReg => {
          subscribeUserToPush(swReg, token);
        });
      }
    } else {
      console.error("No token found in login response:", data);
    }

    return data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
},

  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return await response.json();
  },

  getTasks: async (token, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/tasks?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },

  createTask: async (token, task) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(task),
    });
    return await response.json();
  },

  updateTask: async (token, taskId, updates) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    return await response.json();
  },

  deleteTask: async (token, taskId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },
};
