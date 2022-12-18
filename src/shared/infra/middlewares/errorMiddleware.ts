import AppError from '../../exceptions/AppException';
import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: Error,
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  console.error(err);

  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  return response.status(500).json({
    status: 'error',
    message: 'Internal server/api error',
  });
};
