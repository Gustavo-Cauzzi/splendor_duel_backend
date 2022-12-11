import { createRoomGame } from '../Game/game.service';
import { v4 } from 'uuid';

export default class Room {
  id = v4();
  name = '';
  numberOfPlayers = 0;
  game = createRoomGame();

  constructor(name: string) {
    this.name = name;
    this.numberOfPlayers = 1;
  }
}
