import { Includeable, Op } from 'sequelize';
import { Event } from '../models/event';
import { Group } from '../models/group';
import { State } from '../models/state';
import { User } from '../models/user';

import { ISocketWithJWT } from '../types/auth.types';

export default (socket: ISocketWithJWT): void => {
  const isDev = process.env.NODE_ENV === 'development';

  socket.on('user:join', async () => {
    const user = socket.user;
    const isStudent = socket.jwt.role === 'eleve';

    const groups = await (isStudent ? user.getGroups({ attributes: ['id'] }) : <Array<Group>>[]);

    const eventIncludes: Includeable[] = isStudent
      ? [{ model: Group, where: { id: groups.map(({ id }) => id) }, attributes: ['id'] }]
      : [{ model: User, as: 'owner', where: { id: user.id } }];

    const actualEvent = await Event.findOne({
      where: { start: { [Op.lte]: new Date() }, end: { [Op.gte]: new Date() } },
      include: [...eventIncludes],
    });

    const nextEvent = !actualEvent
      ? await Event.findOne({ where: { start: { [Op.gte]: new Date() } }, include: [...eventIncludes], order: [['start', 'DESC']] })
      : null;

    const state = isStudent ? await State.findOne({ where: { slug: actualEvent ? 'actif' : 'pret' } }) : null;

    if (actualEvent || nextEvent) {
      const eventId = actualEvent?.id || nextEvent?.id;

      // Add the state to the user
      if (state) {
        await user.setState(state);

        isDev && console.log(`${user.username} is now ready !`);
        isDev && eventId && console.log(`${user.username} joined the test ! (event ${eventId})`);
      }

      // Make the user join the rooms
      // rooms e.g : student-event-1 || professor-event-1     event-1
      const rooms = [`${isStudent ? 'student' : 'professor'}-event-${eventId}`, `event-${eventId}`];

      await socket.join(rooms);
      isDev && console.log(`${user.username} joined room ${rooms.join(' and ')} as a ${isStudent ? 'student' : 'professor'}.`);
    }
  });
};
