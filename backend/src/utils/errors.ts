export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'طلب غير صالح') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'غير مصرح') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'غير مسموح') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'غير موجود') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'تعارض في البيانات') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>, message: string = 'خطأ في التحقق من البيانات') {
    super(message, 422);
    this.errors = errors;
  }
}
