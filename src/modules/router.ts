import { IoConnection, SocketConnection } from '@shared/infra/http/server';
import { Router } from 'express';
import { GameRouter } from './Game/game.router';
import { RoomsRouter, RoomsSocketRouter } from './Rooms/rooms.router';
import { UserIoRouter, UsersRouter } from './Users/users.router';

export const allRoutes: Record<string, Router> = {
  '/rooms': RoomsRouter,
  '/games': GameRouter,
  '/users': UsersRouter,
};

export type ApplicationIoRouter = (
  socket: SocketConnection,
  io: IoConnection,
) => void;

export const allIoRoutes: ApplicationIoRouter[] = [
  RoomsSocketRouter,
  UserIoRouter,
];
