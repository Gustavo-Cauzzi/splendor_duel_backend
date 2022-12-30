export type UUID = string; // Só para deixar mais legível

export type StoreCardLevel = 1 | 2 | 3; // 1 = Avançada, 2 = Intermediária, 3 = Básica

export type GemColors =
  | 'Red'
  | 'Green'
  | 'Blue'
  | 'Black'
  | 'Pink'
  | 'White'
  | 'Gold';

export type SideEffect =
  | 'PlayAgain'
  | 'StealGemOtherPlayer'
  | 'GetAPrivilegde'
  | 'GetGemFromBoard'
  | 'AnyValue';

export type BoardPlayCombination = [
  [number, number],
  [number, number],
  [number, number],
];

export interface Card {
  id: UUID; // No catálogo de cartas, cada uma tem que ser catalogada com um ID para sabermos quais já entraram no jogo
  price: Partial<Record<GemColors, number>>;
  sideEffect: SideEffect | undefined;
  points: number;
  crowns: number;
  color: GemColors | 'Neutral';
  gemValue: number; // Há cartas que podem valer múltiplas fichas da certa cor
}

export interface PlayerInfo {
  privileges: number;
  gems: Record<GemColors, number>;
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

export interface CurrentTurnInfo {
  currentPlayerTurn: UUID | null;
  canPickGemsFromTheBoard: boolean;
  canBuyACard: boolean;
}
export interface Game {
  id: UUID;
  currentTurn: CurrentTurnInfo;
  started: boolean;
  board: (GemColors | undefined)[][];
  playerInfo: Record<UUID, PlayerInfo>;
  royals: RoyalCard[];
  store: Record<StoreCardLevel, Card[]>;
  alreadyPlayedCards: UUID[]; // Guardar quais cartas não deve aparecer dos decks da loja novamente
  privileges: number;
}
