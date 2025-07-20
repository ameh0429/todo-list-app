import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// @desc    Register user
// @route   POST /api/register
// @access  Public
export const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }
    
    const { title, description, dueDate, priority, isCompleted } = req.body;
    
    // Find task
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }
    
    // Validate due date is in future (only if being updated and not completed)
    if (dueDate && new Date(dueDate) <= new Date() && !isCompleted) {
      return sendError(res, 400, 'Due date must be in the future');
    }
    
    // Update fields
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description?.trim();
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (priority !== undefined) task.priority = priority;
    if (isCompleted !== undefined) task.isCompleted = isCompleted;
    
    // Save task
    await task.save();
    
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