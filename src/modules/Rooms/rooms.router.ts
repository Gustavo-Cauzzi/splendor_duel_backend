import { ApplicationIoRouter } from '@modules/router';
import { usersSockets } from '@modules/Users/users.service';
import AppError from '@shared/exceptions/AppException';
import express from 'express';
import {
  createRoom,
  getAllOpenRooms,
  joinRoom,
  startGame,
} from './rooms.service';
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

  const otherUsersIds = room.connectedPlayersIds.filter(
    userId => userId !== joiningUserId,
  );

  const otherUsersSocket = otherUsersIds.map(
    otherUserId => usersSockets[otherUserId],
  );
  if (otherUsersSocket.length !== otherUsersIds.length)
    throw new AppError(
      'Algum socket de outro jogador conectado na sala não pode ser localizado',
      400,
    );

  otherUsersSocket.forEach(socket => socket.emit('/rooms/current/update'));

  return res.status(202).json(room);
});

RoomsRouter.get('/start/:roomId', (req, res) => {
  const roomId = req.params.roomId;

  if (!roomId) throw new AppError('roomId não informado', 400);

  const room = startGame(req.user.id, roomId);

  room.connectedPlayersIds.forEach(playerId => {
    const socket = usersSockets[playerId];
    if (!socket)
      throw new AppError(`Socket do usuário ${playerId} não encontrado`);

    socket.emit('/room/started', room);
  });

  return res.json(room).status(200);
});

// Para comunicações Cliente > Servidor
const RoomsSocketRouter: ApplicationIoRouter = (socket, io) => {
  // nada por enquanto
};

export { RoomsRouter, RoomsSocketRouter };
