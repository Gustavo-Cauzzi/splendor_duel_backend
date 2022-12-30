import { usersSockets } from '@modules/Users/users.service';
import AppError from '@shared/exceptions/AppException';
import express from 'express';
import { Game } from './Game';
import * as GameService from './game.service';

const GameRouter = express.Router();

const games: Game[] = [];

GameRouter.post('/:gameId/board/getChips/', (req, res) => {
  const play = req.body.play;

  console.log(
    'req.params.gameId, req.body.play: ',
    req.params.gameId,
    req.body.play,
  );

  if (!play || !req.params.gameId)
    throw new AppError('Parâmetros inválidos', 422);

  const room = GameService.getChipsFromBoard(
    req.user.id,
    req.params.gameId,
    play,
  );

  room.connectedPlayersIds
    .filter(id => id !== req.user.id)
    .forEach(otherUserId => {
      const socket = usersSockets[otherUserId];
      if (!socket)
        throw new AppError(
          `Não foi possível localizar o socket do usuário de id ${otherUserId}`,
        );
      socket.emit('/game/board/chipsAcquired', { play, room });
    });

  return res.status(200).json(room);
});

export { GameRouter };
