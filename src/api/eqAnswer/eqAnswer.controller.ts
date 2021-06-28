import { Request, Response, NextFunction } from 'express';

import { EqAnswer } from '../../models/eqAnswer';

import { InvalidInputError, NotFoundError } from '../../classes/StatusError';
import { Answer } from '../../models/answer';

export const getEqAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eqAnswers = await EqAnswer.findAll();
    res.json(eqAnswers);
  } catch (err) {
    next(err);
  }
};

export const getEqAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eqAnswerId = req.params.eqAnswerId;
    if (!eqAnswerId) return next(new InvalidInputError());

    const eqAnswers = await EqAnswer.findByPk(eqAnswerId);
    res.json(eqAnswers);
  } catch (err) {
    next(err);
  }
};

export const deleteEqAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eqAnswerId = req.params.eqAnswerId;
    if (!eqAnswerId) return next(new InvalidInputError());

    const eqAnswer = await EqAnswer.findByPk(eqAnswerId, { include: Answer });
    if (!eqAnswer) return next(new NotFoundError('Equal Answer'));

    if (eqAnswer.answer) await eqAnswer.answer.destroy();

    await eqAnswer.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
