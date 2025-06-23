import { v4 } from 'uuid';
import { createRoomGame } from '../Game/game.service';

// TODO: Trocar essa estrutura de classe por Object Literal
export default class Room {
  id = v4();
  name = '';
  numberOfPlayers = 0;
  game = createRoomGame();
  connectedPlayersIds: string[] = [];
  leaderPlayerId = '';

  constructor(name: string, creatingUserId: string) {
    this.name = name;
    this.numberOfPlayers = 1;
    this.connectedPlayersIds.push(creatingUserId);
    this.leaderPlayerId = creatingUserId;
  }
}
