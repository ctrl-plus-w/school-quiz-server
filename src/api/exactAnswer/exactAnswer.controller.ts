import { Request, Response, NextFunction } from 'express';

import { ExactAnswer } from '../../models/exactAnswer';

import { InvalidInputError, NotFoundError } from '../../classes/StatusError';
import { Answer } from '../../models/answer';

export const getExactAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exactAnswers = await ExactAnswer.findAll();
    res.json(exactAnswers);
  } catch (err) {
    next(err);
  }
};

export const getExactAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exactAnswerId = req.params.exactAnswerId;
    if (!exactAnswerId) return next(new InvalidInputError());

    const exactAnswers = await ExactAnswer.findByPk(exactAnswerId);
    res.json(exactAnswers);
  } catch (err) {
    next(err);
  }
};

export const deleteExactAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exactAnswerId = req.params.exactAnswerId;
    if (!exactAnswerId) return next(new InvalidInputError());

    const exactAnswer = await ExactAnswer.findByPk(exactAnswerId, { include: Answer });
    if (!exactAnswer) return next(new NotFoundError('Exact Answer'));

    if (exactAnswer.answer) await exactAnswer.answer.destroy();

    await exactAnswer.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
