// Standard API Error Class
export class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}