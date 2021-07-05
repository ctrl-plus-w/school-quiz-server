import { Request, Response, NextFunction } from 'express';

import { Quiz } from '../models/quiz';

import { InvalidInputError, NotFoundError } from '../classes/StatusError';
import { Question } from '../models/question';
import { Answer } from '../models/answer';
import { UserAnswer } from '../models/userAnswer';

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
      ],
      attributes: ['id'],
    });

    if (!question) return next(new NotFoundError('Question'));

    res.locals.question = question;

    next();
  } catch (err) {
    next(err);
  }
};
