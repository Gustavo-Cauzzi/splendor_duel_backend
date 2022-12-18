import AppError from '@shared/exceptions/AppException';
import { database } from '@shared/services/firebase';
import { get, ref, set } from 'firebase/database';
import { sha256 } from 'js-sha256';
import { v4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { User } from './User';
import { Socket } from 'socket.io';
import authConfig from '@config/auth';

type GuaranteedExistence<T> = T extends undefined | null ? never : T;
export const userSocket: Record<GuaranteedExistence<User['id']>, Socket> = {};

const usersRef = ref(database, 'users');

export const createUser = async (username: string, password: string) => {
  let users: User[] = [];
  await get(usersRef).then(snapshot => (users = snapshot.val() ?? []));

  const user = users.find(user => user.username === username);

  if (user) throw new AppError('Username já utilizado', 400);

  const newUser = {
    username,
    password: sha256(password),
    id: v4(),
  };

  users.push(newUser);
  set(usersRef, users);

  const { password: _, ...response } = newUser;
  return response;
};

export const login = async (username: string, password: string) => {
  let users: User[] = [];
  await get(usersRef).then(snapshot => (users = snapshot.val() ?? []));

  const user = users.find(user => user.username === username);

  if (user && user.password === sha256(password)) {
    return jwt.sign(
      { username: user.username, id: user.id },
      authConfig.jwt.secret,
    );
  }

  throw new AppError('Usuário não existe ou senha incorreta', 401);
};

export const assignSocketToUser = (socket: Socket, userId: string) => {
  userSocket[userId] = socket;
};
