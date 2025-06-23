import authConfig from '@config/auth';
import AppError from '@shared/exceptions/AppException';
import { addDays } from 'date-fns';
import { sha256 } from 'js-sha256';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { UsersRepository } from './User.repository';
import { User } from './User.types';

export const usersSockets: Record<User['id'], Socket> = {};

export const createUser = async (username: string, password: string) => {
  const newUser = await UsersRepository.createUser(username, password);

  const token = jwt.sign(
    { username: username, id: newUser.id },
    authConfig.jwt.secret,
  );

  return { ...newUser, token };
};

export const login = async (username: string, password: string) => {
  const user = await UsersRepository.getUserByUsername(username);

  if (user && user.password === sha256(password)) {
    return jwt.sign(
      { username: user.username, id: user.id },
      authConfig.jwt.secret,
    );
  }

  throw new AppError('User does not exist or incorrect password', 401);
};

export const fakeLogin = async (username: string, id: string) => {
  return jwt.sign(
    { username, id, isFakeUser: true, expirationDate: addDays(new Date(), 1) },
    authConfig.jwt.secret,
  );
};

export const assignSocketToUser = (socket: Socket, userId: string) => {
  console.log(`socket ${socket.id} conectado com o usuário ${userId}`);
  const existentSocket = usersSockets[userId];
  if (existentSocket) existentSocket.disconnect();
  usersSockets[userId] = socket;
};
