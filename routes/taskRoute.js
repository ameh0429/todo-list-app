import express from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateTask,
  validateTaskId,
  validateTaskQuery
} from '../middleware/validationMiddleware.js';

const router = express.Router();

// All task routes are protected
router.use(protect);

// Task CRUD routes
router.route('/tasks')
  .get(validateTaskQuery, getTasks)
  .post(validateTask, createTask);

router.route('/tasks/:id')
  .get(validateTaskId, getTask)
  .put(validateTaskId, validateTask, updateTask)
  .delete(validateTaskId, deleteTask);

export default router;