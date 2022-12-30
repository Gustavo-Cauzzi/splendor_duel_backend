export type UUID = string; // Só para deixar mais legível

export type StoreCardLevel = 1 | 2 | 3; // 1 = Básica, 2 = Intermediária, 3 = Avançada

export type ChipColors =
  | 'Red'
  | 'Green'
  | 'Blue'
  | 'Black'
  | 'Pink'
  | 'White'
  | 'Gold';

export enum SideEffect {
  PlayAgain = 'PlayAgain',
  StealChipOtherPlayer = 'StealChipOtherPlayer',
  GetAPrivilegde = 'GetAPrivilegde',
  GetChipFromBoard = 'GetChipFromBoard',
  AnyValue = 'AnyValue',
}

export interface Card {
  id: UUID; // No catálogo de cartas, cada uma tem que ser catalogada com um ID para sabermos quais já entraram no jogo
  price: Partial<Record<ChipColors, number>>;
  sideEffect: SideEffect | undefined;
  points: number;
  crowns: number;
  color: ChipColors | 'Neutral';
  chipValue: number; // Há cartas que podem valer múltiplas fichas da certa cor
}

export interface PlayerInfo {
  privileges: number;
  chips: Record<ChipColors, number>;
  cards: Card[];
  reservedCards: Card[];
  royals: RoyalCard[];
}

export interface RoyalCard {
  id: UUID;
  crowns: number;
  points: number;
  sideEffects: SideEffect | undefined;
}

export interface Game {
  id: UUID;
  currentPlayerTurn: UUID | null;
  started: boolean;
  board: (ChipColors | undefined)[][];
  playerInfo: [PlayerInfo, PlayerInfo];
  royals: RoyalCard[];
  store: Record<StoreCardLevel, Card[]>;
  alreadyPlayedCards: UUID[]; // Guardar quais cartas não deve aparecer dos decks da loja novamente
  privileges: number;
}
