// import Room from "models/Room"

import AppError from '../../shared/exceptions/AppException';
import Room from './Room';

const rooms: Room[] = [];

export const createRoom = (name: string) => {
  const nameAlreadyInUse = rooms.some(room => room.name === name);

  if (nameAlreadyInUse) throw new AppError('Nome já utilizado', 400);

  rooms.push(new Room(name));
};

export const getAllOpenRooms = () => {
  return rooms.filter(room => room.numberOfPlayers === 1);
};
