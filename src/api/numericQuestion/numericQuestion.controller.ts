import { Request, Response, NextFunction } from 'express';
import { InvalidInputError } from '../../classes/StatusError';

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
    res.json(numericQuestion);
  } catch (err) {
    next(err);
  }
};
