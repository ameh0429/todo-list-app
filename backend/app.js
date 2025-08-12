import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cron from "node-cron";
import webpush from "web-push";
import Subscription from "./models/Subscription.js";
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import User from "./models/User.js";
// import Subscription from "../models/User.js";

// import fetch from "node-fetch";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

// Import cron routes
import cronRoutes from "./routes/cron.js";

import Task from "./models/Task.js";

// Import services
import { sendUpcomingTaskReminders } from "./services/emailService.js";

// Import middleware
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// const FCM_SERVER_KEY = "BJ5l-15OMY6S-mx-93YJmi2l5tN8FzSVQrNLHinUmz3EkEMd0jSJzOEoLvpTe5lFiw-MMO8gRzAx_sexGX0j1po";

// Security middleware
app.use(helmet());

const allowedOrigins = [
  "https://todo-list-app-dun-beta.vercel.app",
  "http://localhost:3001",
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

//Log all incoming requests
app.use((req, res, next) => {
  console.log("Incoming request to:", req.path);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use("/cron", cronRoutes);
app.use('/api', subscriptionRoutes);

// Set up web push notifications
webpush.setVapidDetails(
  "mailto:amehmathiasejeh40@gmail.com",
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

// // Save push subscription
// app.post('/api/save-subscription', async (req, res) => {
//   const existing = await Subscription.findOne({ endpoint: req.body.endpoint });
//   if (!existing) {
//     await Subscription.create(req.body);
//   }
//   res.status(201).json({ message: 'Subscription saved' });
// });

// Save a task with due time
app.post("/api/add-task", (req, res) => {
  const { title, dueTime } = req.body;
  tasks.push({ title, dueTime: new Date(dueTime) });
  res.status(201).json({ message: "Task saved" });
});

// Store user's subscription in DB when they allow notifications
// app.post("/subscribe", (req, res) => {
//   const subscription = req.body;
//   saveSubscriptionToDB(subscription);
//   res.status(201).json({});
// });

// Send notification at due time
function sendNotification(subscription, task) {
  const payload = JSON.stringify({
    title: "Task Reminder",
    body: `Your task "${task.title}" is due now!`,
    icon: "/icons/icon-192x192.png"
  });
  webpush.sendNotification(subscription, payload);
}

// Check every minute for due tasks
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const dueTasks = await Task.find({ dueTime: { $lte: now } });

  if (dueTasks.length === 0) return;

  const subscriptions = await Subscription.find();

  dueTasks.forEach(async (task) => {
    const payload = JSON.stringify({
      title: "Task Due!",
      body: `Don't forget: ${task.title}`,
    });

    subscriptions.forEach((sub) => {
      webpush.sendNotification(sub, payload).catch((err) => {
        console.error("Push error:", err);
      });
    });

    await Task.deleteOne({ _id: task._id }); // Remove after notifying
  });
});

app.post('/api/send-test-notification', async (req, res) => {
  try {
    const { userId } = req.body;

    // Fetch the user's push subscription from your database
    const user = await User.findById(userId);
    // const user = await Subscription.findById(userId);
    if (!user || !user.pushSubscription) {
      return res.status(404).json({ error: 'User or subscription not found' });
    }

    // Send a test push notification
    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify({
        title: 'Test Notification',
        body: 'This is a test push notification from your Todo List App!'
      })
    );

    res.status(200).json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

//   // Notification setting
// app.post("/send-notification", async (req, res) => {
//   const { token, title, body } = req.body;

//   const response = await fetch("https://fcm.googleapis.com/fcm/send", {
//     method: "POST",
//     headers: {
//       "Authorization": `key=${FCM_SERVER_KEY}`,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       to: token,
//       notification: { title, body }
//     })
//   });

//   res.json({ status: "Notification sent" });
// });

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Todo API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Schedule daily reminder emails every 5 minutes
cron.schedule(
  "*/5 * * * *",
  () => {
    console.log("Running upcoming task reminders...");
    sendUpcomingTaskReminders();
  },
  {
    timezone: "UTC",
  }
);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});
