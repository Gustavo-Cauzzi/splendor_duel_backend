'./Game.types';

import { Room } from '@modules/Rooms/Room.types';
import { UsersRepository } from '@modules/Users/User.repository';
import { User } from '@modules/Users/User.types';
import AppError from '@shared/exceptions/AppException';
import { CARDS_DEFINITION_BY_TYPE } from './cards';
import { GamesRepository } from './game.repository';
import {
  Card,
  CardAction,
  CardActionDefinitionOf,
  CardActionOf,
  CardType,
  Game,
  SafeGame,
} from './Game.types';
import { cardActions } from './card-actions';

export const gameToSafeGame = (game: Game): SafeGame => {
  const { deck, playersData, ...safeGame } = game;

  const safePlayersData = Object.entries(playersData).reduce(
    (acc, [playerId, data]) => {
      acc[playerId] = {
        ...data,
        heldCardsCount: data.heldCards.length,
      };
      return acc;
    },
    {} as Record<User['id'], SafeGame['playersData'][string]>,
  );

  return {
    ...safeGame,
    deckCount: deck.length,
    playersData: safePlayersData,
  };
};

export const createGame = async (room: Room) => {
  const newGame = await GamesRepository.createGame(room);
  return newGame;
};

export const drawCard = async (userId: string, gameId: string) => {
  const game = await GamesRepository.getGameById(gameId);
  if (!game) {
    throw new AppError('Game not found', 404);
  }

  const user = await UsersRepository.getUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const card = game.deck.pop();
  if (!card) {
    throw new AppError('No cards left in the deck', 400);
  }

  const removedCard = game.deck.splice(game.deck.length - 1, 1)[0];
  game.playersData[userId].heldCards.push(removedCard);

  await GamesRepository.updateGame(gameId, game);

  return card;
};

const validateCardAction = <TCardType extends CardType>(
  cardType: TCardType,
  actionData: CardActionOf<TCardType>,
): CardActionDefinitionOf<TCardType> => {
  if (['princess', 'countess', 'handmaid', 'spy'].includes(cardType)) {
    if (actionData !== undefined) {
      throw new AppError(
        `Action data is not allowed for card type ${cardType}`,
        400,
      );
    }
  } else if (cardType === 'king') {
    const data = actionData as Partial<CardActionOf<'king'>>;
    if (!data?.targetPlayerId) {
      throw new AppError('Trade target is required for King card', 400);
    }
  } else if (cardType === 'chancellor') {
    const data = actionData as Partial<CardActionOf<'chancellor'>>;
    if (!data?.ihavenoclueineedhelpfiguringhowtohandlethisguy) {
      throw new AppError('Card ID is required for Chancellor card', 400);
    }
  } else if (cardType === 'prince') {
    const data = actionData as Partial<CardActionOf<'prince'>>;
    if (!data?.targetPlayerId) {
      throw new AppError('Target player is required for Prince card', 400);
    }
  } else if (cardType === 'baron') {
    const data = actionData as Partial<CardActionOf<'baron'>>;
    if (!data?.targetPlayerId) {
      throw new AppError('Comparison target is required for Baron card', 400);
    }
  } else if (cardType === 'priest') {
    const data = actionData as Partial<CardActionOf<'priest'>>;
    if (!data?.targetPlayerId) {
      throw new AppError('Inspection target is required for Priest card', 400);
    }
  } else if (cardType === 'guard') {
    const data = actionData as Partial<CardActionOf<'guard'>>;
    if (!data?.guess || !data?.targetPlayerId) {
      throw new AppError(
        'Guess and target user are required for Guard card',
        400,
      );
    }
  } else {
    throw new AppError(`Unknown card type: ${cardType}`, 400);
  }

  return {
    type: cardType,
    action: actionData,
  } as CardActionDefinitionOf<TCardType>;
};

const validateCardCanBePlayed = (game: Game, card: Card) => {
  if (!game.currentTurnInfo.playerId) {
    throw new AppError('Player ID is required', 400);
  }

  if (
    !game.playersData[game.currentTurnInfo.playerId].heldCards.some(
      heldCard => heldCard.id === card.id,
    )
  ) {
    throw new AppError("Card is not in the player's hand", 400);
  }
};

export const playCard = async (
  userId: string,
  gameId: string,
  cardId: string,
  actionData: CardAction,
) => {
  const game = await GamesRepository.getGameById(gameId);
  if (!game) {
    throw new AppError('Game not found', 404);
  }

  const user = await UsersRepository.getUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const cardIndex = game.playersData[userId].heldCards.findIndex(
    card => card.id === cardId,
  );
  if (cardIndex === -1) {
    throw new AppError("Card not found in player's hand", 400);
  }

  const card = game.playersData[userId].heldCards.splice(cardIndex, 1)[0];
  validateCardCanBePlayed(game, card);

  const cardAction = validateCardAction(card.type, actionData);

  // Execute card-specific logic
  switch (cardAction.type) {
    case 'guard':
      cardActions.guard(game, userId, cardAction.action);
      break;
    case 'priest':
      cardActions.priest(game, cardAction.action);
      break;
    case 'baron':
      cardActions.baron(game, userId, card, cardAction.action);
      break;
    case 'handmaid':
      cardActions.handmaid(game, userId);
      break;
    case 'prince':
      cardActions.prince(game, cardAction.action);
      break;
    case 'king':
      cardActions.king(game, userId, cardAction.action);
      break;
    case 'countess':
      cardActions.countess(game, userId);
      break;
    case 'princess':
      cardActions.princess(game, userId);
      break;
    case 'chancellor':
      cardActions.chancellor(game, cardAction.action);
      break;
    case 'spy':
      cardActions.spy();
      break;
    default:
      throw new AppError('Unknown card type', 400);
  }

  // Update game state
  await GamesRepository.updateGame(gameId, game);

  return { success: true };
};

export const discardCard = async (
  userId: string,
  gameId: string,
  cardId: string,
) => {
  // TODO
  return { success: true };
};

export const getGame = async (gameId: string) => {
  return { gameId, state: 'example-state' };
};

export const GameService = {
  createGame,
  drawCard,
  playCard,
  discardCard,
  getGame,
};
