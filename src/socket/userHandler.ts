import { Op } from 'sequelize';
import { Event } from '../models/event';
import { Group } from '../models/group';
import { State } from '../models/state';

import { ISocketWithJWT } from '../types/auth.types';

export default (socket: ISocketWithJWT): void => {
  const isDev = process.env.NODE_ENV === 'development';

  socket.on('user:join', async (payload: { eventId?: number }) => {
    if (!payload.eventId) return;

    const user = socket.user;

    if (socket.jwt.role === 'eleve') {
      await socket.join([`student-event-${payload.eventId}`, `event-${payload.eventId}`]);
      isDev && console.log(`${user.username} joined room student-event-${payload.eventId} and event-${payload.eventId} as a student.`);

      const groups = await user.getGroups();
      if (!groups || groups.length === 0) return;

      const groupsId = groups.map(({ id }) => id);

      const actualEvent = await Event.count({
        where: { start: { [Op.lte]: new Date() }, end: { [Op.gte]: new Date() } },
        include: { model: Group, where: { id: groupsId }, attributes: ['id'] },
      });

      const state = await State.findOne({ where: { slug: actualEvent > 0 ? 'actif' : 'pret' } });

      if (state) {
        await user.setState(state);
        isDev && console.log(`${user.username} is now ready !`);
        isDev && actualEvent > 0 && console.log(`${user.username} started the test ! (event ${payload.eventId})`);
      }
    } else {
      await socket.join([`professor-event-${payload.eventId}`, `event-${payload.eventId}`]);
      isDev && console.log(`${user.username} joined room professor-event-${payload.eventId} and event-${payload.eventId} as a professor.`);
    }
  });
};
