import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';
import { InvalidInputError, NotFoundError } from '../classes/StatusError';
import { TypedAnswer } from '../models/answer';

import { ExactAnswer, ExactAnswerCreationAttributes } from '../models/exactAnswer';
import { ComparisonAnswer, ComparisonAnswerCreationAttributes } from '../models/comparisonAnswer';
import { answerFormatter } from './mapper.helper';
import { Question } from '../models/question';

const exactAnswerSchema = Joi.object({
  answerContent: Joi.string().min(1).max(25).required(),
});

const comparisonAnswerSchema = Joi.object({
  greaterThan: Joi.number().positive().required(),
  lowerThan: Joi.number().positive().min(Joi.ref('greaterThan')).required(),
});

const createAnswer = async (question: Question, createdTypedAnswer: TypedAnswer, _req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const createdAnswer = await createdTypedAnswer.createAnswer();

    await question.addAnswer(createdAnswer);

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
      value: ExactAnswerCreationAttributes;
      error?: Error;
    } = exactAnswerSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    const [createdExactAnswer] = await ExactAnswer.findOrCreate({ where: validatedExactAnswer });

    await createAnswer(question, createdExactAnswer, req, res, next);
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
      value: ComparisonAnswerCreationAttributes;
      error?: Error;
    } = comparisonAnswerSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    const [createdComparisonAnswer] = await ComparisonAnswer.findOrCreate({ where: validatedComparisonAnswer });

    await createAnswer(question, createdComparisonAnswer, req, res, next);
  } catch (err) {
    next(err);
  }
};
