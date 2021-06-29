import { Request, Response, NextFunction } from 'express';

import { ComparisonAnswer } from '../../models/comparisonAnswer';

import { InvalidInputError, NotFoundError } from '../../classes/StatusError';

export const getComparisonAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comparisonAnswers = await ComparisonAnswer.findAll();
    res.json(comparisonAnswers);
  } catch (err) {
    next(err);
  }
};

export const getComparisonAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comparisonAnswerId = req.params.comparisonAnswerId;
    if (!comparisonAnswerId) return next(new InvalidInputError());

    const comparisonAnswer = await ComparisonAnswer.findByPk(comparisonAnswerId);
    res.json(comparisonAnswer);
  } catch (err) {
    next(err);
  }
};

export const deleteComparisonAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comparisonAnswerId = req.params.comparisonAnswerId;
    if (!comparisonAnswerId) return next(new InvalidInputError());

    const comparisonAnswer = await ComparisonAnswer.findByPk(comparisonAnswerId);
    if (!comparisonAnswer) return next(new NotFoundError('Comparison Answer'));

    if (comparisonAnswer.answer) comparisonAnswer.answer.destroy();

    await comparisonAnswer.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
