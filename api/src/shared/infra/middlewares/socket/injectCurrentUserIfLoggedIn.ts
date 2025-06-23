import { User } from '@modules/Users/User.types';
import { verify } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import authConfig from '@config/auth';

export const injectCurrentUserIfLoggedIn = (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void,
) => {
  const authHeader = socket.handshake.auth?.Authorization;
  socket.data.global = { user: {} };
  if (authHeader) {
    const [, token] = authHeader.split(' ');

    const { username, id } = verify(token, authConfig.jwt.secret) as User;

    socket.data.global.user = { username, id };
  }

  next();
};
