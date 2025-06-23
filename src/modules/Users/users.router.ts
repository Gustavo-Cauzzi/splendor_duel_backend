import { ApplicationIoRouter } from '@modules/router';
import express from 'express';
import {
  assignSocketToUser,
  createUser,
  fakeLogin,
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

UsersRouter.post('/fakeLogin', async (req, res) => {
  const { username, id } = req.body;

  const token = await fakeLogin(username, id);

  return res.status(200).json({ token });
});

UsersRouter.get('/debug/sockets', async (_req, res) => {
  return res.status(200).json(Object.keys(usersSockets));
});

const UserIoRouter: ApplicationIoRouter = (socket, io) => {
  // Executado no connect
  if (socket.data.global?.user?.id) {
    assignSocketToUser(socket, socket.data.global.user.id);
  }
};

export { UsersRouter, UserIoRouter };
