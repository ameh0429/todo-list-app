export const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  res.status(statusCode).json(response);
};

export const sendError = (res, statusCode, message) => {
  sendResponse(res, statusCode, false, message);
};

export const sendSuccess = (res, statusCode, message, data = null) => {
  sendResponse(res, statusCode, true, message, data);
};