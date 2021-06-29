import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';
import { DuplicationError, InvalidInputError } from '../classes/StatusError';
import { TypedAnswer } from '../models/answer';

import { ExactAnswer } from '../models/exactAnswer';
import { ComparisonAnswer } from '../models/comparisonAnswer';
import { answerFormatter } from './mapper.helper';

const exactAnswerSchema = Joi.object({
  answerContent: Joi.string().min(1).max(25).required(),
});

const comparisonAnswerSchema = Joi.object({
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

export const tryCreateExactAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedExactAnswer,
      error: validationError,
    }: {
      value: ExactAnswer;
      error?: Error;
    } = exactAnswerSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const exactAnswer = await ExactAnswer.findOne({ where: validatedExactAnswer });
    if (exactAnswer) return next(new DuplicationError('Exact Answer'));

    const createdExactAnswer = await ExactAnswer.create(validatedExactAnswer);

    await createAnswer(createdExactAnswer, req, res, next);
  } catch (err) {
    next(err);
  }
};

export const tryCreateComparisonAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedComparisonAnswer,
      error: validationError,
    }: {
      value: ComparisonAnswer;
      error?: Error;
    } = comparisonAnswerSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const comparisonAnswer = await ComparisonAnswer.findOne({ where: validatedComparisonAnswer });
    if (comparisonAnswer) return next(new DuplicationError('Comparison Answer'));

    const createdComparisonAnswer = await ComparisonAnswer.create(validatedComparisonAnswer);

    await createAnswer(createdComparisonAnswer, req, res, next);
  } catch (err) {
    next(err);
  }
};
