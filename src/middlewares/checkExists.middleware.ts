import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';

import { ChoiceQuestion } from '../models/choiceQuestion';
import { UserAnswer } from '../models/userAnswer';
import { Question } from '../models/question';
import { Answer } from '../models/answer';
import { Event } from '../models/event';
import { Group } from '../models/group';
import { Quiz } from '../models/quiz';
import { User } from '../models/user';

import { AcccessForbiddenError, InvalidInputError, NotFoundError, UnknownError } from '../classes/StatusError';

import { MiddlewareValidationPayload } from '../types/middlewares.types';

export const checkEventExists = async (req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
  try {
    const eventId = req.params.eventId;
    if (!eventId) return [false, new InvalidInputError()];

    const event = await Event.findByPk(eventId);
    if (!event) return [false, new NotFoundError('Event')];

    res.locals.event = event;

    return [true, null];
  } catch (err) {
    return err instanceof Error ? [false, err] : [false, new UnknownError()];
  }
};

export const checkQuizExists = async (req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
  try {
    const quizId = req.params.quizId;
    if (!quizId) return [false, new InvalidInputError()];

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) return [false, new NotFoundError('Quiz')];

    res.locals.quiz = quiz;

    return [true, null];
  } catch (err) {
    return err instanceof Error ? [false, err] : [false, new UnknownError()];
  }
};

export const checkQuestionExists = async (req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) return [false, new InvalidInputError()];

    const question = await Question.findByPk(questionId, {
      include: [
        { model: Answer, attributes: ['id'] },
        { model: UserAnswer, attributes: ['id'] },
        { model: ChoiceQuestion, attributes: ['id'] },
      ],
    });

    if (!question) return [false, new NotFoundError('Question')];

    res.locals.question = question;

    return [true, null];
  } catch (err) {
    return err instanceof Error ? [false, err] : [false, new UnknownError()];
  }
};

export const checkActualEventExists = async (req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
  try {
    const userId = res.locals.jwt.userId;

    const user = await User.findByPk(userId, { attributes: ['id', 'roleId'] });
    if (!user) return [false, new NotFoundError('User')];

    const userRole = await user.getRole();
    if (!userRole) return [false, new AcccessForbiddenError()];

    if (userRole.slug === 'professeur') {
      const event = await Event.findOne({
        where: { start: { [Op.lte]: new Date() }, end: { [Op.gte]: new Date() } },
        include: { model: User, where: { id: userId }, attributes: ['id'], as: 'owner' },
      });
      if (!event) return [false, new NotFoundError('Event')];

      res.locals.event = event;
    } else {
      const groups = await user.getGroups();
      if (!groups) return [false, new NotFoundError('User groups')];

      if (groups.length === 0) return [false, new NotFoundError('Event')];

      const groupsId = groups.map(({ id }) => id);

      const event = await Event.findOne({
        where: { start: { [Op.lte]: new Date() }, end: { [Op.gte]: new Date() } },
        include: { model: Group, where: { id: groupsId }, attributes: ['id'] },
      });
      if (!event) return [false, new NotFoundError('Event')];

      res.locals.event = event;
    }

    return [true, null];
  } catch (err) {
    return err instanceof Error ? [false, err] : [false, new UnknownError()];
  }
};
