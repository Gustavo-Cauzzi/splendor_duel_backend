import { ApplicationIoRouter } from '@modules/router';
import AppError from '@shared/exceptions/AppException';
import express from 'express';
import { IncomingMessage } from 'http';
import {
  assignSocketToUser,
  createUser,
  login,
  usersSockets,
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

UsersRouter.get('/debug/sockets', async (req, res) => {
  return res.status(200).json(Object.keys(usersSockets));
});

const UserIoRouter: ApplicationIoRouter = (socket, io) => {
  // Executado no connect
  if (socket.data.global?.user?.id) {
    assignSocketToUser(socket, socket.data.global.user.id);
  }
};

export { UsersRouter, UserIoRouter };
