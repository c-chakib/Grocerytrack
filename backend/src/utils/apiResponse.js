// Standard API Response Wrapper
export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}