import cors from 'cors';
import express, { json } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { allRoutes } from '../../../modules/router';
import { errorMiddleware } from '../middlewares/errorMiddleware';

const PORT = 3333;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['teste'],
    credentials: true,
  },
});

app.use(errorMiddleware);
app.use(json());
app.use(cors());

app.get('/health', (req, res) => {
  res.json({ status: 'up' }).status(200);
});

io.on('connection', socket => {
  console.log('socket connected: ');

  io.emit('testeIrado', 'alegria');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

Object.entries(allRoutes).forEach(([route, router]) => app.use(route, router));

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} 🚀🚀`);
});
