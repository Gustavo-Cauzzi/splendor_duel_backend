import express, { json, NextFunction, Request, Response } from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { allRoutes } from '../../../modules/router';
import AppError from '../../exceptions/AppException';

const PORT = 3333;
const app = express();
app.use(json());

const server = http.createServer(app);
const io = new Server(server);

app.use(
  (err: Error, request: Request, response: Response, next: NextFunction) => {
    if (err instanceof AppError) {
      console.log('err: ', err.message);
      return response.status(err.statusCode).json({
        status: 'error',
        message: err.message,
      });
    }

    console.error(err);

    return response.status(500).json({
      status: 'error',
      message: 'Internal server/api error',
    });
  },
);

app.get('/health', (req, res) => {
  res.json({ status: 'up' }).status(200);
});

io.on('connection', socket => {
  console.log('socket connected: ', socket);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

Object.entries(allRoutes).forEach(([route, router]) => app.use(route, router));

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} 🚀🚀`);
});
