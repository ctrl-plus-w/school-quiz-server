import { State } from '../models/state';

import { userFormatter } from '../helpers/mapper.helper';
import { getEvent } from '../helpers/socket.helper';

import { ISocketWithData } from '../types/auth.types';

export default (socket: ISocketWithData): void => {
  const isDev = process.env.NODE_ENV === 'development';

  socket.on('user:join', async () => {
    const user = socket.user;
    const isStudent = socket.jwt.role === 'eleve';

    const [actualEvent, nextEvent] = await getEvent(user, socket.jwt.role);

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

      if (isStudent) {
        const userState = await socket.user.getState();
        socket.to(`professor-event-${eventId}`).emit('user:update', { ...userFormatter(user), state: userState });
      }
    }
  });
};
