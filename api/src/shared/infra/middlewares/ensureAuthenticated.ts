import authConfig from '@config/auth';
import { User } from '@modules/Users/User.types';
import AppError from '@shared/exceptions/AppException';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export default function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (request.path.includes('/users')) {
    return next();
  }

  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError('JWT não existe', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const { username, id } = verify(token, authConfig.jwt.secret) as User;

    if (!id) throw new AppError('ID do usuário logado não informado', 400);

    request.user = {
      id,
      username,
    };

    return next();
  } catch {
    throw new AppError('JWT inválido', 401);
  }
}
