import { validationResult } from 'express-validator';
import Task from '../models/Task.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { sendTaskCreationEmail } from '../services/emailService.js';

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
    if (dueDate && new Date(dueDate) <= new Date()) {
      return sendError(res, 400, 'Due date must be in the future');
    }
    
    // Create task
    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'Medium',
      userId: req.user._id
    });
    
    // Populate user info for response
    await task.populate('userId', 'name email');
    
    // Send confirmation email
    sendTaskCreationEmail(req.user, task);
    
    sendSuccess(res, 201, 'Task created successfully', { task });
  } catch (error) {
    console.error('Create task error:', error);
    sendError(res, 500, 'Server error during task creation');
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
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter object
    const filter = { userId: req.user._id };
    
    if (isCompleted !== undefined) {
      filter.isCompleted = isCompleted === 'true';
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
        $lt: nextDay
      };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get tasks with pagination
    const [tasks, totalTasks] = await Promise.all([
      Task.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter)
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalTasks / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;
    
    sendSuccess(res, 200, 'Tasks retrieved successfully', {
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalTasks,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    sendError(res, 500, 'Server error during task retrieval');
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
      userId: req.user._id
    });
    
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }
    
    sendSuccess(res, 200, 'Task retrieved successfully', { task });
  } catch (error) {
    console.error('Get task error:', error);
    sendError(res, 500, 'Server error during task retrieval');
  }
};

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
      return sendError(res, 400, 'Due date must be in the future');
    }

    // Find and update the task
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(priority && { priority }),
        ...(typeof isCompleted !== 'undefined' && { isCompleted })
      },
      { new: true }
    );

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    sendSuccess(res, 200, 'Task updated successfully', { task });
  } catch (error) {
    console.error('Update task error:', error);
    sendError(res, 500, 'Server error during task update');
  }
};

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
      userId: req.user._id
    });
    
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }
    
    sendSuccess(res, 200, 'Task deleted successfully');
  } catch (error) {
    console.error('Delete task error:', error);
    sendError(res, 500, 'Server error during task deletion');
  }
};