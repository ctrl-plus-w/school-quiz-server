import { Request, Response, NextFunction } from 'express';

import { Quiz } from '../models/quiz';

import { InvalidInputError, NotFoundError } from '../classes/StatusError';

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
