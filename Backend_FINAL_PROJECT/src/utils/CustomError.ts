export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Это нужно, чтобы в стеке вызовов корректно отображалось имя нашего класса
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
