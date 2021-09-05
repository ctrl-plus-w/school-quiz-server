import { Op } from 'sequelize';

import { Event } from '../models/event';
import { User } from '../models/user';

import { ISocketWithData } from '../types/auth.types';

export default (socket: ISocketWithData): void => {
  socket.on('quiz:start', async () => {
    const user = socket.user;
    const isProfessor = socket.jwt.role === 'professeur';

    if (!isProfessor) return;

    const nextEvent = await Event.findOne({
      where: { start: { [Op.gte]: new Date() } },
      include: [{ model: User, as: 'owner', where: { id: user.id } }],
      order: [['start', 'DESC']],
    });

    if (!nextEvent) return;

    await nextEvent.update({ started: true, startedAt: new Date() });

    socket.to(`event-${nextEvent.id}`).emit('event:start');
  });
};
