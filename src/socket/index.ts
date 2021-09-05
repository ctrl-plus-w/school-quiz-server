import util from 'util';

import { Socket } from 'socket.io';

import { EventWarn } from '../models/eventWarn';
import { User } from '../models/user';
import { Event } from '../models/event';

import { userFormatter } from '../helpers/mapper.helper';
import { getEvent } from '../helpers/socket.helper';

import { ISocketWithData } from '../types/auth.types';

import registerUserHandlers from './userHandler';
import registerQuizHandlers from './quizHandler';

import STATES from '../constants/states';

const onConnection = (_socket: Socket): void => {
  const socket = _socket as ISocketWithData;

  // const redisGetAsync = util.promisify(socket.redisClient.get).bind(socket.redisClient);
  const redisSetAsync = util.promisify(socket.redisClient.set).bind(socket.redisClient);

  registerUserHandlers(socket);
  registerQuizHandlers(socket);

  socket.on('disconnect', async () => {
    const user = socket.user;
    const role = socket.jwt.role;

    await redisSetAsync(socket.user.id.toString(), JSON.stringify(STATES.OFFLINE));

    const [actualEvent, nextEvent] = await getEvent(user, role);
    const event = actualEvent || nextEvent;

    // Send the leave event to the professors
    if (event) {
      const warn = await EventWarn.findOne({
        include: [
          { model: User, where: { id: user.id }, attributes: [] },
          { model: Event, where: { id: event.id }, attributes: [] },
        ],
        attributes: ['amount'],
      });

      socket.to(`professor-event-${event.id}`).emit('user:update', { ...userFormatter(user), state: STATES.OFFLINE, eventWarns: [warn] });
    }
  });
};

export default onConnection;
