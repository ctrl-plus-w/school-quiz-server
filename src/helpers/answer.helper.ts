import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';
import { DuplicationError, InvalidInputError } from '../classes/StatusError';
import { TypedAnswer } from '../models/answer';

import { EqAnswer } from '../models/eqAnswer';
import { GTLTAnswer } from '../models/gtltAnswer';
import { answerFormatter } from './mapper.helper';

const eqAnswerSchema = Joi.object({
  answerContent: Joi.string().min(1).max(25).required(),
});

const gtLtAnswerSchema = Joi.object({
  greaterThan: Joi.number().positive().required(),
  lowerThan: Joi.number().positive().min(Joi.ref('greaterThan')).required(),
});

const createAnswer = async (
  createdTypedAnswer: TypedAnswer,
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const createdAnswer = await createdTypedAnswer.createAnswer();
    res.json(answerFormatter(createdAnswer));
  } catch (err) {
    next(err);
  }
};

export const tryCreateEqAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedEqAnswer,
      error: validationError,
    }: {
      value: EqAnswer;
      error?: Error;
    } = eqAnswerSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const eqAnswer = await EqAnswer.findOne({ where: validatedEqAnswer });
    if (eqAnswer) return next(new DuplicationError('Equal Answer'));

    const createdEqAnswer = await EqAnswer.create(validatedEqAnswer);

    await createAnswer(createdEqAnswer, req, res, next);
  } catch (err) {
    next(err);
  }
};

export const tryCreateGtLtAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedGtLtAnswer,
      error: validationError,
    }: {
      value: GTLTAnswer;
      error?: Error;
    } = gtLtAnswerSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const gtLtAnswer = await GTLTAnswer.findOne({ where: validatedGtLtAnswer });
    if (gtLtAnswer) return next(new DuplicationError('Greater/Lower Answer'));

    const createdGtLtAnswer = await GTLTAnswer.create(validatedGtLtAnswer);

    await createAnswer(createdGtLtAnswer, req, res, next);
  } catch (err) {
    next(err);
  }
};
