import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cron from 'node-cron';
import webpush from "web-push";
// import fetch from "node-fetch";

// Import routes
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Import cron routes
import cronRoutes from './routes/cron.js';


// Import services
import { sendUpcomingTaskReminders } from './services/emailService.js';

// Import middleware
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// const FCM_SERVER_KEY = "BJ5l-15OMY6S-mx-93YJmi2l5tN8FzSVQrNLHinUmz3EkEMd0jSJzOEoLvpTe5lFiw-MMO8gRzAx_sexGX0j1po";

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://todo-list-app-dun-beta.vercel.app',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

//Log all incoming requests
app.use((req, res, next) => {
  console.log("Incoming request to:", req.path);
  next();
});

app.use('/cron', cronRoutes);


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', authRoutes);
app.use('/api', taskRoutes);

// Generate VAPID keys once (keep private key safe)
const vapidKeys = webpush.generateVAPIDKeys();

webpush.setVapidDetails(
  "mailto:you@example.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store user's subscription in DB when they allow notifications
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  saveSubscriptionToDB(subscription);
  res.status(201).json({});
});

// Send notification at due time
function sendNotification(subscription, task) {
  const payload = JSON.stringify({
    title: "Task Reminder",
    body: `Your task "${task.title}" is due now!`,
    icon: "/icons/icon-192x192.png"
  });
  webpush.sendNotification(subscription, payload);
}

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
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Todo API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Schedule daily reminder emails every 5 minutes
cron.schedule('*/5 * * * *', () => {
  console.log('Running upcoming task reminders...');
  sendUpcomingTaskReminders();
}, {
  timezone: "UTC"
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});