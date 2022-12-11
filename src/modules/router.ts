import { Router } from 'express';
import { GameRouter } from './Game/game.router';
import { RoomsRouter } from './Rooms/rooms.router';

export const allRoutes: Record<string, Router> = {
  '/rooms': RoomsRouter,
  '/games': GameRouter,
};
