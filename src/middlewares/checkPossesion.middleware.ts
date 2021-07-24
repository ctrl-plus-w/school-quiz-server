import { Request, Response, NextFunction } from 'express';

import { AcccessForbiddenError, InvalidInputError, NotFoundError } from '../classes/StatusError';
import { Event } from '../models/event';
import { Quiz } from '../models/quiz';
import { User } from '../models/user';

export const checkQuizPossesion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = res.locals.jwt.userId;
    if (!userId) return next(new AcccessForbiddenError());

    const quizId = req.params.quizId || res.locals.quiz.id;
    if (!quizId) return next(new InvalidInputError());

    const user = await User.findByPk(userId);
    if (!user) return next(new NotFoundError('User'));

    const quiz = <Quiz | null>res.locals.quiz || (await Quiz.findByPk(quizId));
    if (!quiz) return next(new NotFoundError('Quiz'));

    if (!quiz.ownerId || quiz.ownerId !== user.id) return next(new AcccessForbiddenError());

    res.locals.quiz = quiz;
    res.locals.user = user;

    next();
  } catch (err) {
    next(err);
  }
};

export const checkEventPossesion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = res.locals.jwt.userId;
    if (!userId) return next(new AcccessForbiddenError());

    const eventId = req.params.eventId || res.locals.event.id;
    if (!eventId) return next(new InvalidInputError());

    const user = await User.findByPk(userId);
    if (!user) return next(new NotFoundError('User'));

    const event = <Event | null>res.locals.event || (await Event.findByPk(eventId));
    if (!event) return next(new NotFoundError('Event'));

    if (!event.ownerId || event.ownerId !== user.id) return next(new AcccessForbiddenError());

    res.locals.quiz = event;
    res.locals.user = user;
    res.locals.event = event;

    next();
  } catch (err) {
    next(err);
  }
};
