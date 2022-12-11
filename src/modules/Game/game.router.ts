import express from 'express';
import { Game } from './Game';

const GameRouter = express.Router();

const games: Game[] = [];

export { GameRouter };
