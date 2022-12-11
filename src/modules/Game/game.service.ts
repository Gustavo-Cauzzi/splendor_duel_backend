import { v4 } from 'uuid';
import { Game } from './Game';

export const createRoomGame = (): Game => {
  return {
    started: false,
    alreadyPlayedCards: [],
    board: [],
    currentPlayerTurn: 0,
    id: v4(),
    playerInfo: [
      {
        cards: [],
        chips: {
          Black: 0,
          Blue: 0,
          Green: 0,
          Pink: 0,
          Red: 0,
        },
        privileges: 0,
        reservedCards: [],
        royals: [],
      },
      {
        cards: [],
        chips: {
          Black: 0,
          Blue: 0,
          Green: 0,
          Pink: 0,
          Red: 0,
        },
        privileges: 0,
        reservedCards: [],
        royals: [],
      },
    ],
    royals: [],
    store: {
      1: [],
      2: [],
      3: [],
    },
    privileges: 3,
  };
};
