import { v4 } from 'uuid';
import { createShuffledDeck } from './cards';
import { Room } from '@modules/Rooms/Room.types';
import { Game, PlayerData } from './Game.types';

const games: Game[] = [];

export const createGame = async (room: Room) => {
  const randomPlayerId =
    room.connectedPlayersIds[
      Math.floor(Math.random() * room.connectedPlayersIds.length)
    ];

  const newGame: Game = {
    id: v4(),
    type: 'love-letter',
    currentTurnInfo: {
      playerId: randomPlayerId,
      hasDrawnACard: false,
      phase: 'setup',
      playedCard: undefined,
    },
    deck: createShuffledDeck(),
    log: [],
    playersData: Object.fromEntries(
      room.connectedPlayersIds.map(id => [
        id,
        {
          discardedCards: [],
          playedCards: [],
          heldCards: [],
          isEliminated: false,
          isProtected: false,
        } as PlayerData,
      ]),
    ),
    started: true,
    winner: undefined,
  };

  games.push(newGame);

  return newGame;
};

const getGameById = async (id: string) => {
  const game = games.find(game => game.id === id);
  if (!game) {
    throw new Error(`Game with ID ${id} was not found`);
  }
  return game;
};

const updateGame = async (id: string, updatedGame: Partial<Game>) => {
  const gameIndex = games.findIndex(game => game.id === id);
  if (gameIndex !== -1) {
    games[gameIndex] = { ...games[gameIndex], ...updatedGame };
    return games[gameIndex];
  }
  return undefined;
};

const deleteGame = async (id: string) => {
  const gameIndex = games.findIndex(game => game.id === id);
  if (gameIndex !== -1) {
    games.splice(gameIndex, 1);
    return true;
  }
  return false;
};

export const GamesRepository = {
  createGame,
  getGameById,
  updateGame,
  deleteGame,
};
