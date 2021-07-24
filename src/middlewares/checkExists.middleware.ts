import { Request, Response, NextFunction } from 'express';

import { Quiz } from '../models/quiz';

import { InvalidInputError, NotFoundError } from '../classes/StatusError';
import { Question } from '../models/question';
import { Answer } from '../models/answer';
import { UserAnswer } from '../models/userAnswer';
import { ChoiceQuestion } from '../models/choiceQuestion';
import { Event } from '../models/event';

export const checkEventExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.eventId;
    if (!eventId) return next(new InvalidInputError());

    const event = await Event.findByPk(eventId);
    if (!event) return next(new NotFoundError('Event'));

    res.locals.event = event;

    next();
  } catch (err) {
    next(err);
  }
};

export const checkQuizExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quizId = req.params.quizId;
    if (!quizId) return next(new InvalidInputError());

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) return next(new NotFoundError('Quiz'));

    res.locals.quiz = quiz;

    next();
  } catch (err) {
    next(err);
  }
};

export const checkQuestionExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) return next(new InvalidInputError());

    const question = await Question.findByPk(questionId, {
      include: [
        { model: Answer, attributes: ['id'] },
        { model: UserAnswer, attributes: ['id'] },
        { model: ChoiceQuestion, attributes: ['id'] },
      ],
    });

    if (!question) return next(new NotFoundError('Question'));

    res.locals.question = question;

    next();
  } catch (err) {
    next(err);
  }
};
