type UUID = string; // Só para deixar mais legível

type StoreCardLevel = 1 | 2 | 3; // 1 = Básica, 2 = Intermediária, 3 = Avançada

export enum ChipColors {
  Red = 'Red',
  Green = 'Green',
  Blue = 'Blue',
  Black = 'Black',
  Pink = 'Pink',
}

export enum SideEffect {
  PlayAgain = 1,
  StealChipOtherPlayer = 2,
  GetAPrivilegde = 3,
  GetChipFromBoard = 4,
  AnyValue = 5,
}

export interface Chip {
  color: ChipColors;
}

export interface Card {
  id: UUID; // No catálogo de cartas, cada uma tem que ser catalogada com um ID para sabermos quais já entraram no jogo
  price: Record<ChipColors, number>;
  sideEffect: SideEffect | undefined;
  points: number;
  crowns: number;
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
  currentPlayerTurn: 0 | 1; // uuid para cada jogador, ou só Jogador 0 e Jogador 1?
  started: boolean;
  board: (Chip | undefined)[][];
  playerInfo: [PlayerInfo, PlayerInfo];
  royals: RoyalCard[];
  store: Record<StoreCardLevel, Card[]>;
  alreadyPlayedCards: UUID[]; // Guardar quais cartas não deve aparecer dos decks da loja novamente
  privileges: number;
}
