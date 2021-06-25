import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { EqAnswer } from '../../models/eqAnswer';

import { InvalidInputError, NotFoundError } from '../../classes/StatusError';

const schema = Joi.object({
  answerContent: Joi.string().min(1).max(25).required(),
});

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

export const createEqAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedEqAnswer = await schema.validateAsync(req.body).catch();
    if (validatedEqAnswer instanceof Error) return next(new InvalidInputError());

    const eqAnswer = await EqAnswer.findOrCreate({ where: validatedEqAnswer });
    res.json(eqAnswer);
  } catch (err) {
    next(err);
  }
};

export const deleteEqAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eqAnswerId = req.params.eqAnswerId;
    if (!eqAnswerId) return next(new InvalidInputError());

    const eqAnswer = await EqAnswer.findByPk(eqAnswerId);
    if (!eqAnswer) return next(new NotFoundError('Equal Answer'));

    await eqAnswer.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
