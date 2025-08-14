import { validationResult } from "express-validator";
import Task from "../models/Task.js";
import Subscription from "../models/Subscription.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { sendTaskCreationEmail } from "../services/emailService.js";

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    const { title, description, dueDate, priority } = req.body;

    // Validate due date is in future
    const parsedDueDate = new Date(dueDate);

    if (!dueDate || isNaN(parsedDueDate.getTime())) {
      return sendError(res, 400, "Due date must be a valid future date");
    }

    if (parsedDueDate <= new Date()) {
      return sendError(res, 400, "Due date must be in the future");
    }
    dueDate: parsedDueDate;

    // Create task
    const task = await Task.create({
      title: title.trim() || "",
      description: description?.trim() || "",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || "Medium",
      userId: req.user._id,
    });

     // Populate user info for response
    await task.populate("userId", "name email");

    // Send confirmation email
    sendTaskCreationEmail(req.user, task);

    // Format Nigerian time (Africa/Lagos) in 12-hour format
    function formatToLagosTime(date) {
      return date?.toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    // Convert task to plain object and append formatted date
    const formattedTask = {
      ...task.toObject(),
      dueDateFormatted: formatToLagosTime(task.dueDate),
      createdAtFormatted: formatToLagosTime(task.createdAt),
      updatedAtFormatted: formatToLagosTime(task.updatedAt),
    };

    // Send response
    return sendSuccess(res, 201, "Task created successfully", { task: formattedTask });
  } catch (error) {
    console.error("Create task error:", error);
    return sendError(res, 500, "Server error during task creation");
  }
};

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    const {
      isCompleted,
      priority,
      dueDate,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { userId: req.user._id };

    if (isCompleted !== undefined) {
      filter.isCompleted = isCompleted === "true";
    }

    if (priority) {
      filter.priority = priority;
    }

    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      filter.dueDate = {
        $gte: date,
        $lt: nextDay,
      };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOption = {};
    sortOption[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get tasks with pagination
    const [tasks, totalTasks] = await Promise.all([
      Task.find(filter).sort(sortOption).skip(skip).limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalTasks / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    sendSuccess(res, 200, "Tasks retrieved successfully", {
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalTasks,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    sendError(res, 500, "Server error during task retrieval");
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    sendSuccess(res, 200, "Task retrieved successfully", { task });
  } catch (error) {
    console.error("Get task error:", error);
    sendError(res, 500, "Server error during task retrieval");
  }
};

// @desc    Auto-complete overdue tasks
// @route   POST /api/tasks/auto-complete
// @access  Private or Internal
// export const autoCompleteTasks = async (req, res) => {
//   try {
//     const now = new Date();
//     const buffer = new Date(now.getTime() + 1000);

//     const overdueTasks = await Task.find({
//       dueDate: { $lte: now },
//       isCompleted: false
//     });

//     console.log(`[${new Date().toISOString()}] Auto-complete triggered`);
//     console.log("Matched overdue tasks:", overdueTasks.map(t => ({
//       title: t.title,
//       dueDate: t.dueDate,
//       isCompleted: t.isCompleted
//     })));

//     const result = await Task.updateMany(
//       { dueDate: { $lte: buffer }, isCompleted: false },
//       { $set: { isCompleted: true } }
//     );

//     sendSuccess(res, 200, "Overdue tasks marked as completed", {
//       updatedCount: result.modifiedCount
//     });
//   } catch (error) {
//     console.error("Auto-complete error:", error);
//     sendError(res, 500, "Server error during auto-completion");
//   }
// };
// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    const { title, description, dueDate, priority, isCompleted } = req.body;

    // Validate due date is in future
    if (dueDate && new Date(dueDate) <= new Date()) {
      return sendError(res, 400, "Due date must be in the future");
    }

    // Find and update the task
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(priority && { priority }),
        ...(typeof isCompleted !== "undefined" && { isCompleted }),
      },
      { new: true }
    );

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    sendSuccess(res, 200, "Task updated successfully", { task });
  } catch (error) {
    console.error("Update task error:", error);
    sendError(res, 500, "Server error during task update");
  }
};



// // Save a task with due time
// app.post('/api/add-task', (req, res) => {
//   const { title, dueTime } = req.body;
//   tasks.push({ title, dueTime: new Date(dueTime) });
//   res.status(201).json({ message: 'Task saved' });
// });

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    sendSuccess(res, 200, "Task deleted successfully");
  } catch (error) {
    console.error("Delete task error:", error);
    sendError(res, 500, "Server error during task deletion");
  }
};
