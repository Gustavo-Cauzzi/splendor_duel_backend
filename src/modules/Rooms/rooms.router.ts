import express from 'express';
import { createRoom, getAllOpenRooms } from './rooms.service';
const RoomsRouter = express.Router();

RoomsRouter.get('/', (req, res) => {
  return res.status(200).json(getAllOpenRooms());
});

RoomsRouter.post('/', (req, res) => {
  const { name } = req.body;

  try {
    return res.status(201).json(createRoom(name));
  } catch (e) {
    return res.status(400).json(e);
  }
});

export { RoomsRouter };
