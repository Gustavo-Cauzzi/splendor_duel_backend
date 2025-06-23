import { toMap } from '@shared/utils/groupUtils';
import { v4 } from 'uuid';
import { Card } from './Game.types';

interface CardDefinition {
  type: Card['type'];
  quantity: number;
  value: number;
  description: string;
}

export const CARDS_DEFINITION: CardDefinition[] = [
  {
    type: 'princess',
    quantity: 1,
    value: 8,
    description: 'If you discard this card, you are out of the round.',
  },
  {
    type: 'countess',
    quantity: 1,
    value: 7,
    description:
      'If you have this card and either the King or Prince in your hand, you must discard this card.',
  },
  {
    type: 'king',
    quantity: 1,
    value: 6,
    description: 'Trade hands with another player of your choice.',
  },
  {
    type: 'chancellor',
    quantity: 2,
    value: 5,
    description:
      'Draw two cards. Keep one and put the other at the bottom of the deck.',
  },
  {
    type: 'prince',
    quantity: 2,
    value: 5,
    description:
      'Choose any player (including yourself) to discard their hand and draw a new card.',
  },
  {
    type: 'handmaid',
    quantity: 2,
    value: 4,
    description:
      'Until your next turn, ignore all effects from other players’ cards.',
  },
  {
    type: 'baron',
    quantity: 2,
    value: 3,
    description:
      'Compare hands with another player. The player with the lower value is out of the round.',
  },
  {
    type: 'priest',
    quantity: 2,
    value: 2,
    description: 'Look at another player’s hand.',
  },
  {
    type: 'guard',
    quantity: 5,
    value: 1,
    description:
      'Choose a player and name a card type. If that player has that card, they are out of the round.',
  },
  {
    type: 'spy',
    quantity: 2,
    value: 0,
    description:
      'At the end of the round, gain 1 token if you are the only player still in the round with this card.',
  },
];

export const CARDS_DEFINITION_BY_TYPE = toMap(
  CARDS_DEFINITION,
  def => def.type,
);

export const createShuffledDeck = () => {
  const fullDeck: typeof CARDS_DEFINITION = CARDS_DEFINITION.flatMap(card =>
    Array(card.quantity).fill({ ...card }),
  );

  const deck: Card[] = fullDeck.map(card => ({ id: v4(), type: card.type }));

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};
