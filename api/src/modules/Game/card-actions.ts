import AppError from '@shared/exceptions/AppException';
import { Card, CardActionOf, Game } from './Game.types';
import { CARDS_DEFINITION_BY_TYPE } from './cards';

// Card-specific action handlers
const handleGuardCard = (
  game: Game,
  userId: string,
  action: CardActionOf<'guard'>,
) => {
  const { guess, targetPlayerId } = action;
  if (!targetPlayerId) {
    throw new AppError('Target player is required for Guard card', 400);
  }

  const targetPlayer = game.playersData[targetPlayerId];
  if (!targetPlayer) {
    throw new AppError('Target player not found', 404);
  }

  if (targetPlayer.heldCards.some(targetCard => targetCard.type === guess)) {
    targetPlayer.isEliminated = true;
  }
};

const handlePriestCard = (game: Game, action: CardActionOf<'priest'>) => {
  const { targetPlayerId } = action;
  if (!targetPlayerId) {
    throw new AppError('Target player is required for Priest card', 400);
  }

  const targetPlayer = game.playersData[targetPlayerId];
  if (!targetPlayer) {
    throw new AppError('Target player not found', 404);
  }

  // Reveal target player's card (handled by game logic/UI)
};

const handleBaronCard = (
  game: Game,
  userId: string,
  card: Card,
  action: CardActionOf<'baron'>,
) => {
  const { targetPlayerId } = action;
  if (!targetPlayerId) {
    throw new AppError('Target player is required for Baron card', 400);
  }

  const targetPlayer = game.playersData[targetPlayerId];
  if (!targetPlayer) {
    throw new AppError('Target player not found', 404);
  }

  const userCardValue = CARDS_DEFINITION_BY_TYPE[card.type].value;
  const targetCardValue =
    CARDS_DEFINITION_BY_TYPE[targetPlayer.heldCards[0].type].value;

  if (userCardValue > targetCardValue) {
    targetPlayer.isEliminated = true;
  } else if (userCardValue < targetCardValue) {
    game.playersData[userId].isEliminated = true;
  }
};

const handleHandmaidCard = (game: Game, userId: string) => {
  game.playersData[userId].isProtected = true;
};

const handlePrinceCard = (game: Game, action: CardActionOf<'prince'>) => {
  const { targetPlayerId } = action;
  if (!targetPlayerId) {
    throw new AppError('Target player is required for Prince card', 400);
  }

  const targetPlayer = game.playersData[targetPlayerId];
  if (!targetPlayer) {
    throw new AppError('Target player not found', 404);
  }

  const discardedCard = targetPlayer.heldCards.pop();

  if (discardedCard?.type === 'princess') {
    targetPlayer.isEliminated = true;
  } else {
    const newCard = game.deck.pop();
    if (!newCard) {
      throw new AppError('No cards left in the deck', 400);
    }
    targetPlayer.heldCards.push(newCard);
  }
};

const handleKingCard = (
  game: Game,
  userId: string,
  action: CardActionOf<'king'>,
) => {
  const { targetPlayerId } = action;
  if (!targetPlayerId) {
    throw new AppError('Target player is required for King card', 400);
  }

  const targetPlayer = game.playersData[targetPlayerId];
  if (!targetPlayer) {
    throw new AppError('Target player not found', 404);
  }

  const userCard = game.playersData[userId].heldCards.pop();
  const targetCard = targetPlayer.heldCards.pop();

  if (userCard && targetCard) {
    game.playersData[userId].heldCards.push(targetCard);
    targetPlayer.heldCards.push(userCard);
  }
};

const handleCountessCard = (game: Game, userId: string) => {
  const hasForbiddenCard = game.playersData[userId].heldCards.some(
    heldCard => heldCard.type === 'king' || heldCard.type === 'prince',
  );

  if (hasForbiddenCard) {
    throw new AppError(
      'Countess must be discarded when holding King or Prince',
      400,
    );
  }
};

const handlePrincessCard = (game: Game, userId: string) => {
  game.playersData[userId].isEliminated = true;
};

const handleChancellorCard = (
  game: Game,
  action: CardActionOf<'chancellor'>,
) => {
  // TODO: Implement chancellor card logic
  const { ihavenoclueineedhelpfiguringhowtohandlethisguy: idontknowId } =
    action;
  if (!idontknowId) {
    throw new AppError('Card ID is required for Chancellor card', 400);
  }
};

const handleSpyCard = () => {
  // Spy card has no special action, just gets discarded
};

export const cardActions = {
  guard: handleGuardCard,
  priest: handlePriestCard,
  baron: handleBaronCard,
  handmaid: handleHandmaidCard,
  prince: handlePrinceCard,
  king: handleKingCard,
  countess: handleCountessCard,
  princess: handlePrincessCard,
  chancellor: handleChancellorCard,
  spy: handleSpyCard,
};
