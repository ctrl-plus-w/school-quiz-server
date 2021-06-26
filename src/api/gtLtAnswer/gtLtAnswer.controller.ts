import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { GTLTAnswer } from '../../models/gtltAnswer';

import { InvalidInputError, NotFoundError } from '../../classes/StatusError';

const schema = Joi.object({
  greaterThan: Joi.number().positive().required(),
  lowerThan: Joi.number().positive().min(Joi.ref('greaterThan')).required(),
});

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

export const createGtLtAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedEqAnswer = await schema.validateAsync(req.body).catch();
    if (validatedEqAnswer instanceof Error) return next(new InvalidInputError());

    const [gtLtAnswer, created] = await GTLTAnswer.findOrCreate({ where: validatedEqAnswer });

    if (created) await gtLtAnswer.createAnswer();

    res.json(gtLtAnswer);
  } catch (err) {
    console.log(err);
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
