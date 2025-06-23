import { v4 } from 'uuid';
import { User } from './User.types';
import { get, ref, set } from 'firebase/database';
import { database } from '@shared/services/firebase';
import AppError from '@shared/exceptions/AppException';
import { sha256 } from 'js-sha256';

const usersRef = ref(database, 'users');

const createUser = async (username: string, password: string) => {
  let users: User[] = [];
  await get(usersRef).then(snapshot => (users = snapshot.val() ?? []));

  const user = users.find(user => user.username === username);

  if (user) throw new AppError('Username is already in use', 400);

  const newUser: User = {
    username,
    password: sha256(password),
    id: v4(),
  };

  users.push(newUser);
  set(usersRef, users);

  const { password: _, ...filteredUser } = newUser;
  return filteredUser;
};

const getUserByUsername = async (username: string) => {
  let users: User[] = [];
  await get(usersRef).then(snapshot => (users = snapshot.val() ?? []));

  return users.find(user => user.username === username);
};

const getUserById = async (id: string) => {
  let users: User[] = [];
  await get(usersRef).then(snapshot => (users = snapshot.val() ?? []));

  return users.find(user => user.id === id);
};

export const UsersRepository = {
  createUser,
  getUserByUsername,
  getUserById,
};
