import { Request, Response, NextFunction } from 'express';
import { InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { NumericQuestion } from '../../models/numericQuestion';

export const getNumericQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const numericQuestions = await NumericQuestion.findAll();
    res.json(numericQuestions);
  } catch (err) {
    next(err);
  }
};

export const getNumericQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const numericQuestionId = req.params.numericQuestionId;
    if (!numericQuestionId) return next(new InvalidInputError());

    const numericQuestion = await NumericQuestion.findByPk(numericQuestionId);
    if (!numericQuestion) return next(new NotFoundError('Question'));

    res.json(numericQuestion);
  } catch (err) {
    next(err);
  }
};
