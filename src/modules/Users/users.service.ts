import authConfig from '@config/auth';
import AppError from '@shared/exceptions/AppException';
import { database } from '@shared/services/firebase';
import { addDays } from 'date-fns';
import { get, ref, set } from 'firebase/database';
import { sha256 } from 'js-sha256';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { v4 } from 'uuid';
import { User } from './User';

type GuaranteedExistence<T> = T extends undefined | null ? never : T;
export const usersSockets: Record<GuaranteedExistence<User['id']>, Socket> = {};

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

  const token = jwt.sign(
    { username: username, id: newUser.id },
    authConfig.jwt.secret,
  );

  const { password: _, ...response } = newUser;
  return { ...response, token };
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
