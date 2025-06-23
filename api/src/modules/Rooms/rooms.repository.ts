import { v4 } from 'uuid';
import { Room } from './Room.types';
import { GamesRepository } from '@modules/Game/game.repository';
import { isTruthy } from '@shared/utils/utils';
import { toMap } from '@shared/utils/groupUtils';

const rooms: Room[] = [];

const MAX_NUMBER_OF_PLAYERS = 6;

const createRoom = async (name: string, creatingUserId: string) => {
  const newRoom: Room = {
    id: v4(),
    name,
    numberOfPlayers: 1,
    gameId: undefined,
    connectedPlayersIds: [creatingUserId],
    leaderPlayerId: creatingUserId,
    started: false,
    maxNumberOfPlayers: MAX_NUMBER_OF_PLAYERS,
  };
  rooms.push(newRoom);
};

const getRoomByGameId = async (gameId: string) => {
  const room = rooms.find(room => room.gameId === gameId);
  if (!room) {
    throw new Error(`Room with the game ID ${gameId} was not found`);
  }
  return room;
};

const getRoomById = async (id: string) => {
  return rooms.find(room => room.id === id);
};

const getRoomByName = async (name: string) => {
  return rooms.find(room => room.name === name);
};

const updateRoom = async (id: string, updatedRoom: Partial<Room>) => {
  const roomIndex = rooms.findIndex(room => room.id === id);
  if (roomIndex !== -1) {
    rooms[roomIndex] = { ...rooms[roomIndex], ...updatedRoom };
    return rooms[roomIndex];
  }
  return undefined;
};

const deleteRoom = async (id: string) => {
  const roomIndex = rooms.findIndex(room => room.id === id);
  if (roomIndex !== -1) {
    rooms.splice(roomIndex, 1);
    return true;
  }
  return false;
};

export const getAllOpenRooms = async () => {
  // const allGameIds =  rooms.map(room => room.gameId);
  // const allGames = await Promise.all(allGameIds.filter(isTruthy).map(GamesRepository.getGameById))
  // const allStartedGames
  // const allGamesById = toMap(allGames, game => game.id)
  return rooms.filter(room => room.started);
};

export const RoomsRepository = {
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomById,
  getRoomByName,
  getRoomByGameId,
  getAllOpenRooms,
};
