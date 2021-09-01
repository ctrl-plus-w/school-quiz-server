import { decode, verify } from 'jsonwebtoken';

import type { ExtendedError } from 'socket.io/dist/namespace';
import type { Socket } from 'socket.io';

import { User } from '../models/user';

import { IAuthPayload, ISocketWithJWT } from '../types/auth.types';

import CREDENTIALS from '../constants/credentials';

export default async (_socket: Socket, next: (err?: ExtendedError | undefined) => void): Promise<void> => {
  const socket = _socket as ISocketWithJWT;

  try {
    const query = socket.handshake.query;
    if (!query || !query.token) throw new Error();

    const token = query.token;
    if (typeof token !== 'string') throw new Error();

    const isValid = verify(token, CREDENTIALS.JWT_TOKEN);
    if (!isValid) throw new Error();

    const tokenData = decode(token) as IAuthPayload;

    const user = await User.findByPk(tokenData.userId);
    if (!user) throw new Error();

    socket.jwt = tokenData;
    socket.user = user;

    next();
  } catch (err) {
    next(new Error('Access forbidden'));
  }
};
