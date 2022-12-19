import { ApplicationIoRouter } from '@modules/router';
import { usersSockets } from '@modules/Users/users.service';
import AppError from '@shared/exceptions/AppException';
import express from 'express';
import { createRoom, getAllOpenRooms, joinRoom } from './rooms.service';
const RoomsRouter = express.Router();

RoomsRouter.get('/', (req, res) => {
  return res.status(200).json(getAllOpenRooms());
});

RoomsRouter.post('/', (req, res) => {
  const { name } = req.body;
  const socket = usersSockets[req.user.id];

  const newRoom = createRoom(name, req.user.id);
  console.log('Criando sala', req.user, socket.id);
  socket.broadcast.emit('/rooms/new', newRoom);

  return res.status(201).json(newRoom);
});

RoomsRouter.patch('/join', (req, res) => {
  const { roomId } = req.body;
  const joiningUserId = req.user.id;

  const userSocket = usersSockets[joiningUserId];

  const room = joinRoom(roomId, joiningUserId);

  // Comunica para todos os OUTROS sockets conectados que uma sala precisa ser atualizada
  userSocket.broadcast.emit('/rooms/update', room);

  const otherUserId = room.connectedPlayersIds.find(
    userId => userId !== joiningUserId,
  );

  if (!otherUserId)
    throw new AppError(
      'Não foi possível encontrar o outro jogador da sala',
      400,
    );

  const otherUserSocket = usersSockets[otherUserId];
  if (!otherUserSocket)
    throw new AppError('Socket do outro jogador não encontrado', 400);

  otherUserSocket.emit('/rooms/current/update');

  return res.status(202).json(room);
});

// Para comunicações Cliente > Servidor
const RoomsSocketRouter: ApplicationIoRouter = (socket, io) => {
  // nada por enquanto
};

export { RoomsRouter, RoomsSocketRouter };
