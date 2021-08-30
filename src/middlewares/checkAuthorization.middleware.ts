import { Request, Response, NextFunction } from 'express';

import { Event } from '../models/event';

import StatusError, { NotFoundError, UnknownError } from '../classes/StatusError';

import { MiddlewareValidationPayload } from '../types/middlewares.types';
import { User } from '../models/user';
import { EventWarn } from '../models/eventWarn';

export const checkIsNotBlocked = async (req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
  try {
    const userId: number = res.locals.jwt.userId;
    const event: Event = res.locals.event;

    const user = await User.findByPk(userId);
    if (!user) return [false, new NotFoundError('User')];

    const warn = await EventWarn.findOne({ where: { eventId: event.id, userId: user.id }, attributes: ['amount'] });
    if (warn && warn.amount > 3) return [false, new StatusError('Access forbidden, you have too much warns.', 403)];

    return [true, null];
  } catch (err) {
    return err instanceof Error ? [false, err] : [false, new UnknownError()];
  }
};
