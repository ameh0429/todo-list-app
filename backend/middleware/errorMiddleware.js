export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  let error = { ...err };
  error.message = err.message;
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, status: 404 };
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Resource already exists';
    error = { message, status: 400 };
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message: message.join(', '), status: 400 };
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};
