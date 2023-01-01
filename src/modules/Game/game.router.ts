import Room from '@modules/Rooms/Room';
import { usersSockets } from '@modules/Users/users.service';
import AppError from '@shared/exceptions/AppException';
import express from 'express';
import { UUID } from './Game';
import * as GameService from './game.service';

const GameRouter = express.Router();

GameRouter.post('/:gameId/board/getGems/', (req, res) => {
  const play = req.body.play;

  if (!play || !req.params.gameId)
    throw new AppError('Parâmetros inválidos', 422);

  const room = GameService.getGemsFromBoard(
    req.user.id,
    req.params.gameId,
    play,
  );

  notifyAllOthers(req.user.id, room, '/game/board/gemsAcquired', {
    play,
    room,
  });
  return res.status(200).json(room);
});

GameRouter.post('/:gameId/store/buy/:cardId', (req, res) => {
  const { cardId, gameId } = req.params;
  if (!cardId || !gameId) throw new AppError('Parâmetros invállidos', 422);
  const room = GameService.buyCard(req.user.id, cardId, gameId);

  notifyAllOthers(req.user.id, room, '/game/store/cardBought', {
    cardId,
    room,
  });
  return res.status(200).json(room);
});

GameRouter.post('/:gameId/board/getGemUsingPrivilege', (req, res) => {
  const gemCoordinate = req.body.gemCoordinate;

  if (!gemCoordinate || !req.params.gameId)
    throw new AppError('Parâmetros inválidos', 422);

  const room = GameService.usePrivillegeToBuyGem(
    req.user.id,
    req.params.gameId,
    gemCoordinate,
  );

  notifyAllOthers(req.user.id, room, '/game/board/gemsAcquired', {
    play: [gemCoordinate],
    room,
  });

  return res.status(200).json({ room });
});

GameRouter.post('/:gameId/endTurn', (req, res) => {
  if (!req.params.gameId) throw new AppError('Parâmetros inválidos', 422);

  const room = GameService.endCurrentTurn(req.user.id, req.params.gameId);

  notifyAllOthers(req.user.id, room, '/game/turnEnded', { room });

  return res.status(200).json({ room });
});

const notifyAllOthers = (
  currentUserId: UUID,
  room: Room,
  ev: string,
  ...args: any[]
) => {
  room.connectedPlayersIds
    .filter(id => id !== currentUserId)
    .forEach(otherUserId => {
      const socket = usersSockets[otherUserId];
      if (!socket)
        throw new AppError(
          `Não foi possível localizar o socket do usuário de id ${otherUserId}`,
        );
      socket.emit(ev, ...args);
    });
};

export { GameRouter };
