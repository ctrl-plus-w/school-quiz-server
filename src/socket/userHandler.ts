import util from 'util';

import { EventWarn } from '../models/eventWarn';
import { Event } from '../models/event';
import { User } from '../models/user';

import { userFormatter } from '../helpers/mapper.helper';
import { getEvent } from '../helpers/socket.helper';

import { ISocketWithData } from '../types/auth.types';

import STATES from '../constants/states';

export default (socket: ISocketWithData): void => {
  const isDev = process.env.NODE_ENV === 'development';

  // const redisGetAsync = util.promisify(socket.redisClient.get).bind(socket.redisClient);
  const redisSetAsync = util.promisify(socket.redisClient.set).bind(socket.redisClient);

  socket.on('user:join', async () => {
    const user = socket.user;
    const isStudent = socket.jwt.role === 'eleve';

    const [actualEvent, nextEvent] = await getEvent(user, socket.jwt.role);

    // const state = isStudent ? await State.findOne({ where: { slug: actualEvent ? 'actif' : 'pret' } }) : null;

    if (actualEvent || nextEvent) {
      const eventId = actualEvent?.id || nextEvent?.id;

      // Make the user join the rooms
      // rooms e.g : student-event-1 || professor-event-1     event-1
      const rooms = [`${isStudent ? 'student' : 'professor'}-event-${eventId}`, `event-${eventId}`];

      await socket.join(rooms);
      isDev && console.log(`${user.username} joined room ${rooms.join(' and ')} as a ${isStudent ? 'student' : 'professor'}.`);

      // Add the state to the user
      if (isStudent) {
        const state = actualEvent ? STATES.ONLINE : STATES.READY;
        await redisSetAsync(socket.user.id.toString(), JSON.stringify(state));

        isDev && console.log(`${user.username} is now ready !`);
        isDev && eventId && console.log(`${user.username} joined the test ! (event ${eventId})`);

        const warn = await EventWarn.findOne({ where: { eventId: eventId, userId: user.id }, attributes: ['amount'] });

        socket.to(`professor-event-${eventId}`).emit('user:update', { ...userFormatter(user), state: state, eventWarns: [warn] });
      }
    }
  });

  socket.on('user:warn', async () => {
    const user = socket.user;

    // Only fetching the actual event
    const [event] = await getEvent(user, socket.jwt.role, true);
    if (!event) return;

    const quiz = await event.getQuiz();
    if (!quiz || !quiz.strict) return;

    const warn = await EventWarn.findOne({
      include: [
        { model: User, where: { id: user.id }, attributes: [] },
        { model: Event, where: { id: event.id }, attributes: [] },
      ],
      attributes: ['amount'],
    });

    // * Trick to update the ManyToMany middle table. (Adding here make sequelize update the table)

    const newWarnAmount = warn ? warn.amount + 1 : 1;
    if (newWarnAmount > 3) return;

    await event.addWarnedUser(user, { through: { amount: newWarnAmount } });

    socket.to(`professor-event-${event.id}`).emit('user:warn', user.id, newWarnAmount);

    if (newWarnAmount >= 3) {
      socket.emit('quiz:blocked');
    }
  });
};
