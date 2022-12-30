import { boardOrderConfig } from '@config/splendor_duel/board';
import { cards, cardsPerLevel } from '@config/splendor_duel/cards';
import { totalChipCountConfig } from '@config/splendor_duel/chips';
import Room from '@modules/Rooms/Room';
import { rooms } from '@modules/Rooms/rooms.service';
import AppError from '@shared/exceptions/AppException';
import { v4 } from 'uuid';
import {
  BoardPlayCombination,
  Card,
  ChipColors,
  Game,
  StoreCardLevel,
  UUID,
} from './Game';

export const createRoomGame = (): Game => {
  return {
    id: v4(),
    started: false,
    alreadyPlayedCards: [],
    board: [[], [], [], [], []],
    currentPlayerTurn: null,
    playerInfo: {},
    royals: [],
    store: {
      1: [],
      2: [],
      3: [],
    },
    privileges: 3,
  };
};

// Gera um vetor de cartas randomizadas para o level informado sem repetições
const randomizeStoreLevel = (
  level: StoreCardLevel,
  alreadyPlayedCards: UUID[],
) => {
  return Array.from(new Array(cardsPerLevel[level]).keys()).reduce(
    (acc, _curr) => {
      let newCard: Card;
      do {
        newCard = cards[level][Math.floor(Math.random() * cards[level].length)];
      } while (
        !newCard ||
        acc.some(card => card.id === newCard.id) ||
        alreadyPlayedCards.includes(newCard.id)
      );
      acc.push(newCard);
      return acc;
    },
    [] as Card[],
  );
};

const recalculateBag = (game: Game) => {
  const bag = { ...totalChipCountConfig };
  game.board.forEach(row => row.forEach(cell => cell && bag[cell]--));
  Object.values(game.playerInfo).forEach(playerInfo =>
    Object.entries(playerInfo.chips).forEach(
      ([color, amount]) => (bag[color as ChipColors] -= amount),
    ),
  );
  return bag;
};

const repopulateBoard = (game: Game) => {
  const bag = recalculateBag(game);
  const colorsWithAvaliableGems = Object.entries(bag)
    .filter(([_color, amount]) => amount > 0)
    .map(([color]) => color);

  for (const [y, x] of boardOrderConfig) {
    // Acabou a bag
    if (colorsWithAvaliableGems.length === 0) break;

    // Celula já possue uma gema atrelada a ela
    if (game.board[y][x]) continue;

    const randomColor = colorsWithAvaliableGems[
      Math.floor(Math.random() * colorsWithAvaliableGems.length)
    ] as ChipColors;

    game.board[y][x] = randomColor;
    bag[randomColor]--;

    // Se não tiver mais gemas na bag da respectiva cor, remova-a das cores disponíveis
    if (bag[randomColor] === 0)
      colorsWithAvaliableGems.splice(
        colorsWithAvaliableGems.indexOf(randomColor),
        1,
      );
  }

  return game.board;
};

export const startGame = (room: Room) => {
  const newGame = {
    ...room.game,
    started: true,
    currentPlayerTurn: room.connectedPlayersIds[Math.floor(Math.random() * 2)],
    store: {
      1: randomizeStoreLevel(1, room.game.alreadyPlayedCards),
      2: randomizeStoreLevel(2, room.game.alreadyPlayedCards),
      3: randomizeStoreLevel(3, room.game.alreadyPlayedCards),
    },
    playerInfo: room.connectedPlayersIds
      .map(id => ({
        [id]: {
          cards: [],
          chips: {
            Black: 0,
            Blue: 0,
            Green: 0,
            Pink: 0,
            White: 0,
            Red: 0,
            Gold: 0,
          },
          privileges: 0,
          reservedCards: [],
          royals: [],
        },
      }))
      .reduce((acc, obj) => ({ ...acc, ...obj }), {}),
  };

  repopulateBoard(newGame);

  return newGame;
};

const validateBoardPlayCombination = (
  boardPlayCombination: BoardPlayCombination,
  board: Game['board'],
) => {
  if (boardPlayCombination.length !== 3) return false;
  boardPlayCombination.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const diffrenceX = boardPlayCombination[0][0] - boardPlayCombination[1][0];
  const diffrenceY = boardPlayCombination[0][1] - boardPlayCombination[1][1];

  if (diffrenceX < -1 || diffrenceY < -1) return false;

  const diffrenceX2 = boardPlayCombination[1][0] - boardPlayCombination[2][0];
  const diffrenceY2 = boardPlayCombination[1][1] - boardPlayCombination[2][1];

  if (diffrenceX !== diffrenceX2 || diffrenceY2 !== diffrenceY) return false;

  // Alguma célula selecionada está vazia
  if (boardPlayCombination.some(([y, x]) => !board[y][x])) return false;

  return true;
};

export const getChipsFromBoard = (
  userId: UUID,
  gameId: UUID,
  boardPlayCombination: BoardPlayCombination,
) => {
  const room = rooms.find(room => room.game.id === gameId);
  if (!room)
    throw new AppError(`Sala com jogo de ID ${gameId} não foi encontrada`);

  if (!room.connectedPlayersIds.includes(userId))
    throw new AppError('Jogador não pertence a essa sala', 401);

  if (room.game.currentPlayerTurn !== userId)
    throw new AppError('Não é a vez do jogador tentando jogar', 401);

  if (!validateBoardPlayCombination(boardPlayCombination, room.game.board))
    throw new AppError('Não é possível fazer tal jogada');

  boardPlayCombination.forEach(([coordY, coordX]) => {
    const cellColor = room.game.board[coordY][coordX];
    if (!cellColor) throw new Error('validateBoardPlayCombination incorreto');
    room.game.board[coordY][coordX] = undefined;
    room.game.playerInfo[userId].chips[cellColor]++;
  });

  return room;
};
