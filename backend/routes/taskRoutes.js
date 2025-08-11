import express from 'express';
import {
  createTask,
  getTasks,
  getTask,
  autoCompleteTasks,
  subscribeTask,
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

  // route for auto-completion
router.route('/tasks/auto-complete')
  .post(autoCompleteTasks); // Auto-complete overdue tasks

  // route for subscrition
router.route('/save-subscription')
  .post(subscribeTask); 

router.route('/tasks/:id')
  .get(validateTaskId, getTask)
  .put(validateTaskId, validateTask, updateTask)
  .delete(validateTaskId, deleteTask);

export default router;