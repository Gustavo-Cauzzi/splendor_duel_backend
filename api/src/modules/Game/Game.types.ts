import { User } from '@modules/Users/User.types';
import { TypedOmit, UUID } from '@shared/types/utils';

type CardActionDefinition =
  | { type: 'princess'; action?: undefined }
  | { type: 'countess'; action?: undefined }
  | { type: 'king'; action: { targetPlayerId: User['id'] } }
  | {
      type: 'chancellor';
      action: { ihavenoclueineedhelpfiguringhowtohandlethisguy: Card['id'] };
    }
  | { type: 'prince'; action: { targetPlayerId: User['id'] } }
  | { type: 'handmaid'; action?: undefined }
  | { type: 'baron'; action: { targetPlayerId: User['id'] } }
  | { type: 'priest'; action: { targetPlayerId: User['id'] } }
  | { type: 'guard'; action: { guess: CardType; targetPlayerId: User['id'] } }
  | { type: 'spy'; action?: undefined };

export type CardType = CardActionDefinition['type'];
export type CardAction = CardActionDefinition['action'];

export type CardActionDefinitionOf<TCardType extends CardType> = Extract<
  CardActionDefinition,
  { type: TCardType }
>;
export type CardActionOf<TCardType extends CardType> = Extract<
  CardActionDefinition,
  { type: TCardType }
>['action'];

export type Card = {
  id: UUID;
  type: CardType;
};

// type PlayedCard<TCardType extends CardType> =  {
//   id: Card['id'],
//   type: TCardType,
// } & (TCardType extends 'princess' ? never : never)

export interface PlayerData {
  discardedCards: Card[];
  playedCards: Card[];
  heldCards: Card[];
  isEliminated: boolean;
  isProtected: boolean;
}

export interface Game {
  id: UUID;
  started: boolean;
  type: 'love-letter';
  winner: User['id'] | undefined;
  currentTurnInfo: {
    playerId: User['id'] | undefined;
    phase: 'setup' | 'in-progress' | 'finished';
    hasDrawnACard: boolean;
    playedCard: Card['id'] | undefined;
  };

  playersData: Record<User['id'], PlayerData>;

  deck: Card[];

  log: Array<{
    playerId: User['id'];
    action: string;
    timestamp: Date;
  }>;
}

export type SafeGame = TypedOmit<Game, 'deck' | 'playersData'> & {
  deckCount: number;
  playersData: Record<
    User['id'],
    TypedOmit<PlayerData, 'heldCards'> & {
      heldCardsCount: number;
    }
  >;
};
