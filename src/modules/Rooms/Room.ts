import { v4 } from 'uuid';
import { createRoomGame } from '../Game/game.service';

export default class Room {
  id = v4();
  name = '';
  numberOfPlayers = 0;
  game = createRoomGame();
  connectedPlayersSocket: string[] = [];

  constructor(name: string, creatingUserId: string) {
    this.name = name;
    this.numberOfPlayers = 1;
    this.connectedPlayersSocket.push(creatingUserId);
  }
}
