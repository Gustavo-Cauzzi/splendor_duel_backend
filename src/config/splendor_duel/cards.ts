import { Card, SideEffect, StoreCardLevel } from '@modules/Game/Game';
import { v4 } from 'uuid';

const injectIds = (cards: Omit<Card, 'id'>[]) =>
  cards.map(card => ({ ...card, id: v4() }));

export const cardsPerLevel: Record<StoreCardLevel, number> = {
  1: 3,
  2: 4,
  3: 5,
};

export const cards: Record<StoreCardLevel, Card[]> = {
  1: injectIds([
    {
      color: 'Black',
      crowns: 0,
      points: 4,
      price: {
        White: 2,
        Red: 2,
        Green: 6,
      },
      sideEffect: undefined, // https://www.youtube.com/watch?v=OcniwpVyni4&ab_channel=RomirPlayHouse
      chipValue: 1,
    },
    {
      color: 'Red',
      crowns: 2,
      points: 3,
      price: {
        Blue: 4,
        Green: 3,
        Black: 3,
        Pink: 1,
      },
      sideEffect: undefined, // https://www.youtube.com/watch?v=OcniwpVyni4&ab_channel=RomirPlayHouse
      chipValue: 1,
    },
    {
      color: 'Blue',
      crowns: 2,
      points: 3,
      price: {
        White: 3,
        Green: 3,
        Black: 5,
        Pink: 1,
      },
      sideEffect: undefined, // https://www.youtube.com/watch?v=OcniwpVyni4&ab_channel=RomirPlayHouse
      chipValue: 1,
    },
    {
      color: 'Red',
      crowns: 0,
      points: 4,
      price: {
        Green: 2,
        Red: 6,
        Black: 2,
      },
      sideEffect: undefined, // https://www.youtube.com/watch?v=OcniwpVyni4&ab_channel=RomirPlayHouse
      chipValue: 1,
    },
  ]),
  2: injectIds([
    {
      color: 'White',
      crowns: 2,
      points: 0,
      price: {
        Green: 6,
        Pink: 1,
      },
      sideEffect: 'AnyValue',
      chipValue: 1,
    },
    {
      color: 'Blue',
      crowns: 1,
      points: 2,
      price: {
        White: 3,
        Red: 2,
        Black: 2,
        Pink: 1,
      },
      sideEffect: undefined,
      chipValue: 1,
    },
    {
      color: 'Red',
      crowns: 0,
      points: 1,
      price: {
        Blue: 3,
        Black: 4,
      },
      sideEffect: 'StealChipOtherPlayer',
      chipValue: 1,
    },
    {
      color: 'White',
      crowns: 0,
      points: 1,
      price: {
        Blue: 5,
        Green: 2,
      },
      sideEffect: undefined,
      chipValue: 2,
    },
  ]),
  3: injectIds([
    {
      chipValue: 1,
      color: 'Neutral',
      crowns: 0,
      points: 1,
      price: {
        Black: 4,
        Pink: 1,
      },
      sideEffect: 'AnyValue',
    },
    {
      points: 1,
      chipValue: 1,
      color: 'Black',
      crowns: 0,
      price: {
        Blue: 2,
        Green: 3,
      },
      sideEffect: undefined,
    },
    {
      chipValue: 1,
      color: 'Neutral',
      crowns: 1,
      points: 0,
      price: {
        White: 4,

        Pink: 1,
      },
      sideEffect: 'AnyValue',
    },
    {
      chipValue: 1,
      color: 'Neutral',
      crowns: 0,
      points: 1,
      price: {
        White: 2,
        Green: 2,
        Black: 1,
        Pink: 1,
      },
      sideEffect: 'AnyValue',
    },
    {
      chipValue: 1,
      color: 'Black',
      crowns: 1,
      points: 0,
      price: {
        White: 2,
      },
      sideEffect: undefined,
    },
  ]),
};
