import { ApplicationIoRouter } from '@modules/router';
import { userSocket } from '@modules/Users/users.service';
import express from 'express';
import { createRoom, getAllOpenRooms } from './rooms.service';
const RoomsRouter = express.Router();

RoomsRouter.get('/', (req, res) => {
  return res.status(200).json(getAllOpenRooms());
});

RoomsRouter.post('/', (req, res) => {
  const { name } = req.body;
  const socket = userSocket[req.user.id];

  const newRoom = createRoom(name, req.user.id);
  socket.emit('/rooms/new', newRoom);

  return res.status(201).json(newRoom);
});

const RoomsSocketRouter: ApplicationIoRouter = (socket, io) => {
  // nada por enquanto
};

export { RoomsRouter, RoomsSocketRouter };
