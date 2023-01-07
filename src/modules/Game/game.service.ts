import { boardOrderConfig } from '@config/splendor_duel/board';
import {
  cardsPerLevel,
  cardsRepository,
  royalsRepository,
} from '@config/splendor_duel/cards';
import { totalGemCountConfig } from '@config/splendor_duel/gems';
import Room from '@modules/Rooms/Room';
import { rooms } from '@modules/Rooms/rooms.service';
import AppError from '@shared/exceptions/AppException';
import { v4 } from 'uuid';
import {
  BoardPlayCombination,
  Card,
  Game,
  GemColors,
  GemCoordinate,
  PlayerInfo,
  StoreCardLevel,
  UUID,
} from './Game';

export const createRoomGame = (): Game => {
  return {
    id: v4(),
    started: false,
    alreadyPlayedCardsId: [],
    board: [[], [], [], [], []],
    currentTurn: {
      secondayActions: {
        canReplanishTheBoard: false,
        canTradePrivilegeToGem: false,
      },
      canMakeMainAction: false,
      currentPlayerTurn: undefined,
    },
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
        newCard =
          cardsRepository[level][
            Math.floor(Math.random() * cardsRepository[level].length)
          ];
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
  const bag = { ...totalGemCountConfig };
  game.board.forEach(row => row.forEach(cell => cell && bag[cell]--));
  Object.values(game.playerInfo).forEach(playerInfo =>
    Object.entries(playerInfo.gems).forEach(
      ([color, amount]) => (bag[color as GemColors] -= amount),
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
    ] as GemColors;

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
    currentTurn: {
      canMakeMainAction: true,
      secondayActions: {
        canReplanishTheBoard: true,
        canTradePrivilegeToGem: true,
      },
      currentPlayerTurn:
        room.connectedPlayersIds[Math.floor(Math.random() * 2)],
    },
    store: {
      1: randomizeStoreLevel(1, room.game.alreadyPlayedCardsId),
      2: randomizeStoreLevel(2, room.game.alreadyPlayedCardsId),
      3: randomizeStoreLevel(3, room.game.alreadyPlayedCardsId),
    },
    royals: royalsRepository,
    playerInfo: room.connectedPlayersIds
      .map(id => ({
        [id]: {
          cards: {
            Red: [],
            Green: [],
            Blue: [],
            Black: [],
            Pink: [],
            White: [],
            Gold: [],
          },
          gems: {
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
    privileges: 2,
  };

  const otherPlayerId = room.connectedPlayersIds.find(
    id => id !== newGame.currentTurn.currentPlayerTurn,
  );
  if (!otherPlayerId)
    throw new AppError(
      'It was not possible to find the other player involved in the game',
    );

  newGame.playerInfo[otherPlayerId].privileges = 1;

  repopulateBoard(newGame);

  return newGame;
};

const getWinConditionsStatus = (playerInfo: PlayerInfo) => {
  return Object.entries(playerInfo.cards)
    .map(([color, cards]) =>
      cards.map(card => ({ color: color as keyof PlayerInfo['cards'], card })),
    )
    .flat()
    .reduce(
      (acc, { color, card }) => {
        acc.points[color] += card.points;

        return {
          ...acc,
          totalPoints: acc.totalPoints + card.points,
          crowns: acc.crowns + card.crowns,
        };
      },
      { crowns: 0, points: {} as Record<GemColors, number>, totalPoints: 0 },
    );
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

  if (boardPlayCombination.some(([y, x]) => board[y][x] === 'Gold'))
    throw new AppError(
      'It is not possible to get a golden gem without reserving a card',
    );

  return true;
};

const getRoomByGameId = (gameId: UUID) => {
  const room = rooms.find(room => room.game.id === gameId);
  if (!room)
    throw new AppError(`Room with the game ID ${gameId} was not found`);
  return room;
};

const assertPlayerCanPlay = (room: Room, userId: UUID) => {
  if (!room.connectedPlayersIds.includes(userId))
    throw new AppError('The player does not belong to this game', 401);

  if (room.game.currentTurn.currentPlayerTurn !== userId)
    throw new AppError(
      "It is not the turn of the player who's trying to play",
      401,
    );
};

export const getGemsFromBoard = (
  userId: UUID,
  gameId: UUID,
  boardPlayCombination: BoardPlayCombination,
) => {
  const room = getRoomByGameId(gameId);
  assertPlayerCanPlay(room, userId);

  if (!room.game.currentTurn.canMakeMainAction)
    throw new AppError('The player cannot take any more gems in its turn', 400);

  if (!validateBoardPlayCombination(boardPlayCombination, room.game.board))
    throw new AppError('It is not possible to do this play');

  if (
    // Testar se as três gemas são da mesma exata cor
    boardPlayCombination.reduce(
      (acc, [y, x]) =>
        (acc ?? room.game.board[y][x]) === room.game.board[y][x]
          ? room.game.board[y][x]
          : false,
      undefined as string | boolean | undefined,
    ) ||
    // Duas delas são pérolas rosas
    boardPlayCombination.filter(([y, x]) => room.game.board[y][x] === 'Pink')
      .length === 2
  ) {
    const otherPlayerInfo = getOtherPlayerInfo(userId, room);
    if (otherPlayerInfo.privileges !== 3) {
      otherPlayerInfo.privileges++;
      if (room.game.privileges === 0) {
        room.game.playerInfo[userId].privileges--;
      } else {
        room.game.privileges--;
      }
    }
  }

  boardPlayCombination.forEach(([coordY, coordX]) => {
    const cellColor = room.game.board[coordY][coordX];
    if (!cellColor) throw new AppError('Play validation is wrong!!', 500); // VAI QUE...
    room.game.board[coordY][coordX] = undefined;
    room.game.playerInfo[userId].gems[cellColor]++;
  });

  room.game.currentTurn.canMakeMainAction = false;

  return room;
};

const replaceCardInStore = (cardId: UUID, game: Game) => {
  const [cardLevel] =
    Object.entries(game.store).find(([_level, cards]) =>
      cards.find(card => card.id === cardId),
    ) ?? [];

  if (!cardLevel)
    throw new AppError(
      `It was not possible to find card with id ${cardId} in the store`,
    );

  const level = Number(cardLevel) as keyof Game['store'];

  let possibleCards = cardsRepository[level].filter(
    card =>
      !game.alreadyPlayedCardsId.find(playedCardId => playedCardId === card.id),
  );

  if (possibleCards.length === 0) {
    console.error(
      'Não há mais cartas possíveis no catálogo de cartas ;-; ;-; ;-; ;-; ;-; ;-;',
    );
    // TODO apagar isso quando tiver todas as cartas catalogadas
    possibleCards = cardsRepository[Number(cardLevel) as 1 | 2 | 3];
  }

  game.store[level] = game.store[level].map(card =>
    card.id === cardId
      ? possibleCards[Math.floor(Math.random() * possibleCards.length)]
      : card,
  );
};

export const buyCard = (
  userId: UUID,
  cardId: UUID,
  gameId: UUID,
  targetColor?: GemColors,
) => {
  const room = getRoomByGameId(gameId);
  assertPlayerCanPlay(room, userId);

  if (!room.game.currentTurn.canMakeMainAction)
    throw new AppError('The player cannot buy anymore cards in its turn', 400);

  const card = Object.values(room.game.store)
    .flat()
    .find(card => card.id === cardId);

  if (!card)
    throw new AppError('This card is not available in the store anymore');

  if (card.color === 'Neutral' && !targetColor)
    throw new AppError('A color must be chosen for the neutral color card');

  if (targetColor === 'Gold' || targetColor === 'Pink')
    throw new AppError(`${targetColor} is not a valid color for a card`);

  const userInfo = room.game.playerInfo[userId];

  // Preço da carta com o seu preço real subtraido pelas cartas do jogador
  const theoreticalPrice = Object.entries(card.price).map(
    ([color, amount]) => ({
      color: color as GemColors,
      price: Math.max(amount - userInfo.cards[color as GemColors].length, 0),
    }),
  );

  const notEnoughGems = theoreticalPrice.filter(
    ({ color, price }) => userInfo.gems[color] < price,
  );

  const goldenGemsRequired = notEnoughGems
    .map(gems => gems.price)
    .reduce((a, b) => a + b);

  if (goldenGemsRequired > userInfo.gems.Gold)
    throw new AppError(
      `The player doesn't have enough ${notEnoughGems
        .map(gem => gem.color)
        .join(', ')
        .replace(/,([^,]*)$/, ' and$1')} gems to buy this card`,
    );

  [
    ...theoreticalPrice,
    { color: 'Gold' as GemColors, price: goldenGemsRequired },
  ].forEach(({ color, price }) => (userInfo.gems[color] = Math.max(price, 0)));

  userInfo.cards[card.color === 'Neutral' ? targetColor! : card.color].push(
    card,
  );

  room.game.alreadyPlayedCardsId.push(card.id);
  replaceCardInStore(cardId, room.game);

  // Não há nada mais que possa ser feito
  invalidateAllActionsFromCurrentTurn(room.game);

  return room;
};

export const usePrivillegeToBuyGem = (
  userId: UUID,
  gameId: UUID,
  gemPosition: GemCoordinate,
) => {
  const room = getRoomByGameId(gameId);
  assertPlayerCanPlay(room, userId);

  if (!room.game.currentTurn.secondayActions.canTradePrivilegeToGem) {
    throw new AppError(
      'The player cannot execute this secondary action anymore',
      401,
    );
  }

  if (room.game.playerInfo[userId].privileges === 0) {
    throw new AppError('The player does not have any more privileges');
  }

  const board = room.game.board;
  if (!board[gemPosition[0]][gemPosition[1]])
    throw new AppError('There is not a gem in the requested position');

  if (board[gemPosition[0]][gemPosition[1]] === 'Gold')
    throw new AppError(
      'It is not possible to get a golden gem using a privilege',
    );

  // Adiciona uma gema para a cor escolhida
  room.game.playerInfo[userId].gems[
    board[gemPosition[0]][gemPosition[1]] as GemColors
  ]++;

  // Tira um privilégio
  room.game.playerInfo[userId].privileges--;

  // Jogador não pode mais executar uma ação secundária
  room.game.currentTurn.secondayActions.canTradePrivilegeToGem = false;

  board[gemPosition[0]][gemPosition[1]] = undefined;

  return room;
};

// Enibe todas as possibilidades de jogadas do jogador atual. Usado após uma jogada principal
const invalidateAllActionsFromCurrentTurn = (game: Game) => {
  game.currentTurn.canMakeMainAction = false;
  game.currentTurn.secondayActions.canReplanishTheBoard = false;
  game.currentTurn.secondayActions.canTradePrivilegeToGem = false;
};

export const endCurrentTurn = (userId: UUID, gameId: UUID) => {
  const room = getRoomByGameId(gameId);
  assertPlayerCanPlay(room, userId);

  if (room.game.currentTurn.canMakeMainAction) {
    throw new AppError(
      'The player must perform its primary action before ending the turn',
    );
  }

  const otherPlayerId = room.connectedPlayersIds.find(id => id !== userId);
  room.game.currentTurn = {
    currentPlayerTurn: otherPlayerId,
    canMakeMainAction: true,
    secondayActions: {
      canReplanishTheBoard: true,
      canTradePrivilegeToGem: true,
    },
  };

  return room;
};

const getOtherPlayerInfo = (userId: UUID, room: Room) => {
  const otherPlayerId = room.connectedPlayersIds.find(id => id !== userId);
  if (!otherPlayerId)
    throw new AppError(
      'It was not possible to find the other player involved in the game',
    );
  return room.game.playerInfo[otherPlayerId];
};

export const reserveCard = (
  userId: UUID,
  gameId: UUID,
  cardId: UUID,
  goldenGemCoordinate: GemCoordinate,
) => {
  const room = getRoomByGameId(gameId);
  assertPlayerCanPlay(room, userId);

  if (room.game.playerInfo[userId].reservedCards.length >= 3)
    throw new AppError(
      'You cannot perform this action if you already have 3 reserved cards',
    );

  // Garantir que o cardId esta na loja realmente
  const card = Object.values(room.game.store)
    .flat()
    .find(card => card.id === cardId);
  if (!card) throw new AppError('Card not found in the store');

  if (
    room.game.board[goldenGemCoordinate[0]][goldenGemCoordinate[1]] !== 'Gold'
  )
    throw new AppError(
      'It is not possible to reserve a card using a not golden gem',
    );

  const otherUserId = room.connectedPlayersIds.find(id => id !== userId);
  if (!otherUserId) throw new AppError('Could not find other player');

  // Se não há mais privilégios na mesa, deve-se pegar do outro jogador (no caso, quem está reservando irá ter que perder um privilégio)
  if (room.game.privileges) {
    room.game.privileges--;
  } else {
    room.game.playerInfo[userId].privileges--;
  }

  room.game.playerInfo[otherUserId].privileges++;

  room.game.playerInfo[userId].reservedCards.push(card);
  room.game.alreadyPlayedCardsId.push(card.id);
  replaceCardInStore(cardId, room.game);
  invalidateAllActionsFromCurrentTurn(room.game);

  return room;
};

export const getRoyal = (userId: string, gameId: UUID, royalId: string) => {
  const room = getRoomByGameId(gameId);
  assertPlayerCanPlay(room, userId);

  const { crowns } = getWinConditionsStatus(room.game.playerInfo[userId]);
  if (Math.floor(crowns / 3) === room.game.playerInfo[userId].royals.length)
    throw new AppError('User cannot get another royal right now');

  const royal = room.game.royals.find(royal => royal.id === royalId);
  if (!royal)
    throw new AppError('Royal not found or is not available to purchase');

  room.game.playerInfo[userId].royals.push(royal);
  room.game.royals = room.game.royals.filter(royal => royal.id !== royalId);

  return room;
};
