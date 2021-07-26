import { Request, Response, NextFunction } from 'express';

import { Event } from '../models/event';
import { Quiz } from '../models/quiz';
import { User } from '../models/user';

import { AcccessForbiddenError, InvalidInputError, NotFoundError, UnknownError } from '../classes/StatusError';

import { MiddlewareValidationPayload } from '../types/middlewares.types';

export const checkQuizOwner = async (req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
  try {
    const userId = res.locals.jwt.userId;
    if (!userId) return [false, new AcccessForbiddenError()];

    const quizId = req.params.quizId || res.locals.quiz.id;
    if (!quizId) return [false, new InvalidInputError()];

    const user = await User.findByPk(userId);
    if (!user) return [false, new NotFoundError('User')];

    const quiz = <Quiz | null>res.locals.quiz || (await Quiz.findByPk(quizId));
    if (!quiz) return [false, new NotFoundError('Quiz')];

    if (!quiz.ownerId || quiz.ownerId !== user.id) return [false, new AcccessForbiddenError()];

    res.locals.quiz = quiz;
    res.locals.user = user;

    return [true, null];
  } catch (err) {
    return err instanceof Error ? [false, err] : [false, new UnknownError()];
  }
};

export const checkQuizModifyPermission = async (req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
  try {
    const userId = res.locals.jwt.userId;
    if (!userId) return [false, new AcccessForbiddenError()];

    const quizId = req.params.quizId || res.locals.quiz.id;
    if (!quizId) return [false, new InvalidInputError()];

    const user = await User.findByPk(userId);
    if (!user) return [false, new NotFoundError('User')];

    const quiz = <Quiz | null>res.locals.quiz || (await Quiz.findByPk(quizId));

    if (!quiz) return [false, new NotFoundError('Quiz')];
    if (!quiz.ownerId) [false, next(new AcccessForbiddenError())];

    const collaboratorsWithSameId = await quiz.getCollaborators({ where: { id: userId } });
    if (collaboratorsWithSameId.length === 0 && quiz.ownerId !== userId) return [false, new AcccessForbiddenError()];

    res.locals.quiz = quiz;
    res.locals.user = user;

    return [true, null];
  } catch (err) {
    return err instanceof Error ? [false, err] : [false, new UnknownError()];
  }
};

export const checkEventOwner = async (req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
  try {
    const userId = res.locals.jwt.userId;
    if (!userId) return [false, new AcccessForbiddenError()];

    const eventId = req.params.eventId || res.locals.event.id;
    if (!eventId) return [false, new InvalidInputError()];

    const user = await User.findByPk(userId);
    if (!user) return [false, new NotFoundError('User')];

    const event = <Event | null>res.locals.event || (await Event.findByPk(eventId));
    if (!event) return [false, new NotFoundError('Event')];

    if (!event.ownerId || event.ownerId !== user.id) return [false, new AcccessForbiddenError()];

    res.locals.quiz = event;
    res.locals.user = user;
    res.locals.event = event;

    return [true, null];
  } catch (err) {
    return err instanceof Error ? [false, err] : [false, new UnknownError()];
  }
};

export const checkEventModifyPermission = async (req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
  try {
    const userId = res.locals.jwt.userId;
    if (!userId) return [false, new AcccessForbiddenError()];

    const eventId = req.params.eventId || res.locals.event.id;
    if (!eventId) return [false, new InvalidInputError()];

    const user = await User.findByPk(userId);
    if (!user) return [false, new NotFoundError('User')];

    const event = <Event | null>res.locals.event || (await Event.findByPk(eventId));

    if (!event) return [false, new NotFoundError('Event')];
    if (!event.ownerId) return [false, new AcccessForbiddenError()];

    const collaboratorsWithSameId = await event.getCollaborators({ where: { id: userId } });
    if (collaboratorsWithSameId.length === 0 && event.ownerId !== userId) return [false, new AcccessForbiddenError()];

    res.locals.quiz = event;
    res.locals.user = user;
    res.locals.event = event;

    return [true, null];
  } catch (err) {
    return err instanceof Error ? [false, err] : [false, new UnknownError()];
  }
};
