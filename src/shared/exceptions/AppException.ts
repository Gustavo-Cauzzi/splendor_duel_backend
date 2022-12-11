export default class AppError {
  public readonly message: string; // 2

  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    // 1
    this.message = message;
    this.statusCode = statusCode;
  }
}
