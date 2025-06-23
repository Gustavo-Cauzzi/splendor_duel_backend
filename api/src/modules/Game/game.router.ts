import AppError from '@shared/exceptions/AppException';
import { Router } from 'express';
import { GameService } from './game.service';
import { UUID } from '@shared/types/utils';
import { usersSockets } from '@modules/Users/users.service';
import { Room } from '@modules/Rooms/Room.types';

const GameRouter = Router();

// Draw a card
GameRouter.post('/:gameId/draw', async (req, res) => {
  const { gameId } = req.params;

  if (!gameId) throw new AppError('Game ID is required', 422);

  const card = await GameService.drawCard(req.user.id, gameId);

  return res.status(200).json({ card });
});

// Play a card
GameRouter.post('/:gameId/play', async (req, res) => {
  const { gameId } = req.params;
  const { cardId, targetPlayerId } = req.body;

  if (!gameId || !cardId)
    throw new AppError('Game ID and Card ID are required', 422);

  const result = await GameService.playCard(
    req.user.id,
    gameId,
    cardId,
    targetPlayerId,
  );

  return res.status(200).json({ result });
});

// Discard a card
GameRouter.post('/:gameId/discard', async (req, res) => {
  const { gameId } = req.params;
  const { cardId } = req.body;

  if (!gameId || !cardId)
    throw new AppError('Game ID and Card ID are required', 422);

  const result = await GameService.discardCard(req.user.id, gameId, cardId);

  return res.status(200).json({ result });
});

// Get game state
GameRouter.get('/:gameId', async (req, res) => {
  const { gameId } = req.params;

  if (!gameId) throw new AppError('Game ID is required', 422);

  const gameState = await GameService.getGame(gameId);

  return res.status(200).json({ gameState });
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
