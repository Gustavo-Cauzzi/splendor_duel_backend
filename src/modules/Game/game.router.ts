import Room from '@modules/Rooms/Room';
import { usersSockets } from '@modules/Users/users.service';
import AppError from '@shared/exceptions/AppException';
import express from 'express';
import { UUID } from './Game';
import * as GameService from './game.service';

const GameRouter = express.Router();

/**
 * body: {
 *  play: [
 *    [0, 1],
 *    [1, 1],
 *    [2, 1]
 *  ]
 * }
 *
 * OBS: Mandar as coordenadas como se fosse as coordenadas da matriz do tabuleiro
 * com (0, 0) sendo o canto superior esquerdo.
 */
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

/**
 * Body: {
 *  targetColor?: GemColors,
 * }
 *
 * targetColor = Cor a ser considerada para a carta. Deve ser mandado quando está sendo comprado uma carta neutra (sem cor)
 */
GameRouter.post('/:gameId/store/buy/:cardId', (req, res) => {
  const { cardId, gameId } = req.params;
  const { targetColor } = req.body;
  if (!cardId || !gameId) throw new AppError('Parâmetros invállidos', 422);
  const room = GameService.buyCard(req.user.id, cardId, gameId, targetColor);

  notifyAllOthers(req.user.id, room, '/game/store/cardBought', {
    cardId,
    room,
  });
  return res.status(200).json(room);
});

/**
 * body: {
 *    gemCoordinate: [number, number]
 * }
 */
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

/**
 * Para reservar uma carta, é necessário recolher uma gema dorada. Enviar no body então a coordenada dessa gema
 *
 * body: {
 *    gemCoordinate: [number, number]
 * }
 */
GameRouter.post('/:gameId/reserveCard/:cardId', (req, res) => {
  const { cardId, gameId } = req.params;
  const gemCoordinate = req.body.gemCoordinate;

  if (!cardId || !gameId || !gemCoordinate)
    throw new AppError('Parâmetros inválidos', 422);

  const room = GameService.reserveCard(
    req.user.id,
    gameId,
    cardId,
    gemCoordinate,
  );

  notifyAllOthers(req.user.id, room, '/game/cardReserved', { room });

  return res.status(200).json({ room });
});

/**
 * Nenhum body
 */
GameRouter.post('/:gameId/royal/buy/:royalId', (req, res) => {
  const { royalId, gameId } = req.params;

  if (!royalId || !gameId) throw new AppError('Parâmetros inválidos', 422);

  const room = GameService.getRoyal(req.user.id, gameId, royalId);

  notifyAllOthers(req.user.id, room, '/game/royalBought', { room });

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
