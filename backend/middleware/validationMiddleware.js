import { body, param, query } from 'express-validator';

export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateTask = [
  body('title')
    .trim()
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('dueDate')
    .optional()
    .custom(value => {
      const parsedDate = new Date(value);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Due date must be a valid 12-hour format date');
      }
      if (parsedDate <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    })
];

export const validateTaskId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID')
];

export const validateTaskQuery = [
  query('isCompleted')
    .optional()
    .isBoolean()
    .withMessage('isCompleted must be true or false'),
  query('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  query('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];
