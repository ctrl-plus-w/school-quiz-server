import { Request, Response, NextFunction } from 'express';

import { Quiz } from '../models/quiz';
import { Question } from '../models/question';
import { Answer } from '../models/answer';
import { UserAnswer } from '../models/userAnswer';
import { ChoiceQuestion } from '../models/choiceQuestion';
import { Event } from '../models/event';

import { InvalidInputError, NotFoundError, UnknownError } from '../classes/StatusError';

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
