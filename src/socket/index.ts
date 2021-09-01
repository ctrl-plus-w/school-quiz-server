import { Socket } from 'socket.io';
import { State } from '../models/state';

import { ISocketWithJWT } from '../types/auth.types';

import registerUserHandlers from './userHandler';

const onConnection = (_socket: Socket): void => {
  const socket = _socket as ISocketWithJWT;

  registerUserHandlers(socket);

  socket.on('disconnect', async () => {
    const inactiveState = await State.findOne({ where: { slug: 'inactif' } });

    if (inactiveState) {
      socket.user.setState(inactiveState);
    }
  });
};

export default onConnection;
