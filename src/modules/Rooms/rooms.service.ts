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
  return rooms.filter(room => room.numberOfPlayers === 1);
};
