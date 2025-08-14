import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cron from "node-cron";
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import { sendDueTaskNotifications } from "./services/pushService.js";
import "./cronJobs/autoCompleteTasksCron.js";


// Import routes
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

// Import cron routes
// import cronRoutes from "./routes/cron.js";

// import Task from "./models/Task.js";

// Import services
import { sendUpcomingTaskReminders } from "./services/emailService.js";

// Import middleware
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
// app.use("/cron", cronRoutes);
app.use('/api', subscriptionRoutes);

// Save a task with due time
app.post("/api/add-task", (req, res) => {
  const { title, dueTime } = req.body;
  tasks.push({ title, dueTime: new Date(dueTime) });
  res.status(201).json({ message: "Task saved" });
});


// Every minute
cron.schedule("* * * * *", () => {
  console.log("Checking for due tasks...");
  sendDueTaskNotifications();
});

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
