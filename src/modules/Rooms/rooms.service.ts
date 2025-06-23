import AppError from '../../shared/exceptions/AppException';
import Room from './Room';
import * as GameService from '../Game/game.service';
import { usersSockets } from '@modules/Users/users.service';

export const rooms: Room[] = [];

export const createRoom = (name: string, creatingUserId: string) => {
  if (!name) throw new AppError('Nome não informado', 400);

  const nameAlreadyInUse = rooms.some(room => room.name === name);

  if (nameAlreadyInUse) throw new AppError('Nome já utilizado', 400);

  const newRoom = new Room(name, creatingUserId);
  rooms.push(newRoom);
  return newRoom;
};

export const getAllOpenRooms = () => {
  return rooms.filter(room => !room.game.started);
};

export const joinRoom = (roomId: string, userId: string) => {
  const room = rooms.find(room => room.id === roomId);

  if (!room) {
    throw new AppError('Não foi possível encontrar a respectiva sala', 400);
  }

  if (room.numberOfPlayers === 2) {
    throw new AppError('Sala cheia', 401);
  }

  if (
    room.connectedPlayersIds.some(connectedUserId => connectedUserId === userId)
  ) {
    throw new AppError(
      'Alguém já conectado a uma sala não entrar na mesma sala',
      401,
    );
  }

  room.connectedPlayersIds.push(userId);
  room.numberOfPlayers++;

  return room;
};

export const startGame = (userId: string, roomId: string) => {
  const room = rooms.find(room => room.id === roomId);

  if (!room) {
    throw new AppError(
      'Não foi possível localizar a sala com id solicitado',
      400,
    );
  }

  if (room.leaderPlayerId !== userId) {
    throw new AppError('Apenas o líder da sala pode iniciá-la', 401);
  }

  if (room.connectedPlayersIds.length !== 2) {
    // Splendor specific rule
    throw new AppError(
      `Não há jogadores suficientes para iniciar a partida (${room.connectedPlayersIds.length})`,
      401,
    );
  }

  room.game = GameService.startGame(room);

  return room;
};
