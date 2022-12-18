import { ApplicationIoRouter } from '@modules/router';
import AppError from '@shared/exceptions/AppException';
import express from 'express';
import { IncomingMessage } from 'http';
import {
  assignSocketToUser,
  createUser,
  login,
  userSocket,
} from './users.service';
const UsersRouter = express.Router();

UsersRouter.post('/', async (req, res) => {
  const { username, password } = req.body;

  const user = await createUser(username, password);

  return res.status(200).json(user);
});

UsersRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const token = await login(username, password);

  return res.status(200).json({ token });
});

const UserIoRouter: ApplicationIoRouter = (socket, io) => {
  socket.on('/user/myUserId', (currentUserId: string, callback) => {
    if (!currentUserId) {
      console.error('Não foi informado o id do usuário');
      callback({ error: 'Não foi informado o id do usuário' });
    }

    assignSocketToUser(socket, currentUserId);
  });
};

export { UsersRouter, UserIoRouter };
