import { Op } from 'sequelize';

import type { Includeable } from 'sequelize/types';

import { Event } from '../models/event';
import { Group } from '../models/group';
import { User } from '../models/user';

export const getEvent = async (user: User, roleSlug: string, onlyActual = false): Promise<[Event | null, Event | null]> => {
  const isStudent = roleSlug === 'eleve';

  const groups = await (isStudent ? user.getGroups({ attributes: ['id'] }) : <Array<Group>>[]);

  const eventIncludes: Includeable[] = isStudent
    ? [{ model: Group, where: { id: groups.map(({ id }) => id) }, attributes: ['id'] }]
    : [{ model: User, as: 'owner', where: { id: user.id } }];

  const actualEvent = await Event.findOne({
    where: {
      [Op.or]: [
        { start: { [Op.lte]: new Date() }, end: { [Op.gte]: new Date() } },
        { start: { [Op.gte]: new Date() }, started: true },
      ],
    },
    include: [...eventIncludes],
  });

  const nextEvent =
    !actualEvent && !onlyActual
      ? await Event.findOne({ where: { start: { [Op.gte]: new Date() } }, include: [...eventIncludes], order: [['start', 'DESC']] })
      : null;

  return [actualEvent, nextEvent];
};
