import AppError from '../../shared/exceptions/AppException';
import Room from './Room';

const rooms: Room[] = [];

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
