import { Socket } from 'socket.io';
import { userFormatter } from '../helpers/mapper.helper';
import { getEvent } from '../helpers/socket.helper';
import { State } from '../models/state';

import { ISocketWithData } from '../types/auth.types';

import registerUserHandlers from './userHandler';
import registerQuizHandlers from './quizHandler';

const onConnection = (_socket: Socket): void => {
  const socket = _socket as ISocketWithData;

  registerUserHandlers(socket);
  registerQuizHandlers(socket);

  socket.on('disconnect', async () => {
    const user = socket.user;
    const role = socket.jwt.role;

    const inactiveState = await State.findOne({ where: { slug: 'inactif' } });

    // Update the user state
    if (inactiveState) {
      socket.user.setState(inactiveState);
    }

    const [actualEvent, nextEvent] = await getEvent(user, role);
    const event = actualEvent || nextEvent;

    // Send the leave event to the professors
    if (event) {
      socket.to(`professor-event-${event.id}`).emit('user:update', { ...userFormatter(user), state: inactiveState });
    }
  });
};

export default onConnection;
