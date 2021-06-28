import { Request, Response, NextFunction } from 'express';

import { GTLTAnswer } from '../../models/gtltAnswer';

import { InvalidInputError, NotFoundError } from '../../classes/StatusError';

export const getGtLtAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const gtLtAnswers = await GTLTAnswer.findAll();
    res.json(gtLtAnswers);
  } catch (err) {
    next(err);
  }
};

export const getGtLtAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const gtLtAnswerId = req.params.gtLtAnswerId;
    if (!gtLtAnswerId) return next(new InvalidInputError());

    const gtLtAnswer = await GTLTAnswer.findByPk(gtLtAnswerId);
    res.json(gtLtAnswer);
  } catch (err) {
    next(err);
  }
};

export const deleteGtLtAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const gtLtAnswerId = req.params.gtLtAnswerId;
    if (!gtLtAnswerId) return next(new InvalidInputError());

    const gtLtAnswer = await GTLTAnswer.findByPk(gtLtAnswerId);
    if (!gtLtAnswer) return next(new NotFoundError('Greater Lower'));

    if (gtLtAnswer.answer) gtLtAnswer.answer.destroy();

    await gtLtAnswer.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
