import { User } from '@modules/Users/User.types';
import cors from 'cors';
import express, { json } from 'express';
import 'express-async-errors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { allIoRoutes, allRoutes } from '../../../modules/router';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import { errorMiddleware } from '../middlewares/errorMiddleware';
import { injectCurrentUserIfLoggedIn } from '../middlewares/socket/injectCurrentUserIfLoggedIn';

const PORT = 3333;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['teste'],
    credentials: true,
  },
});

export type IoConnection = typeof io;
export type SocketConnection = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { global: { user?: User } } & Record<string, unknown>
>;

app.use(json());
app.use(cors());
app.use(ensureAuthenticated);
Object.entries(allRoutes).forEach(([route, router]) => app.use(route, router));
app.use(errorMiddleware);

io.use(injectCurrentUserIfLoggedIn);

app.get('/health', (req, res) => {
  res.json({ status: 'up' }).status(200);
});

io.on('connection', socket => {
  console.log(`Socket of id ${socket.id} connected`);

  allIoRoutes.forEach(ioRouter => ioRouter(socket, io));
});

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} 🚀🚀`);
});
