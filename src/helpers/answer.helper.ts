import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';
import { DuplicationError, InvalidInputError, NotFoundError } from '../classes/StatusError';
import { Answer, TypedAnswer } from '../models/answer';

import { ExactAnswer, ExactAnswerCreationAttributes } from '../models/exactAnswer';
import { ComparisonAnswer, ComparisonAnswerCreationAttributes } from '../models/comparisonAnswer';
import { answerFormatter, answerMapper } from './mapper.helper';
import { Question } from '../models/question';
import { AllOptional } from '../types/optional.types';

const exactAnswerSchema = Joi.object({
  answerContent: Joi.string().min(1).max(25).required(),
});

const arrayExactAnswerSchema = Joi.array().items(exactAnswerSchema).min(1);

const comparisonAnswerCreationSchema = Joi.object({
  greaterThan: Joi.number().required(),
  lowerThan: Joi.number().min(Joi.ref('greaterThan')).required(),
});

const arrayComparisonAnswerSchema = Joi.array().items(comparisonAnswerCreationSchema).min(1);

const comparisonAnswerUpdateSchema = Joi.object({
  greaterThan: Joi.number(),
  lowerThan: Joi.number(),
}).min(1);

const createAnswer = async (question: Question, createdTypedAnswer: TypedAnswer, _req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const createdAnswer = await createdTypedAnswer.createAnswer();

    await question.addAnswer(createdAnswer);

    res.json(answerFormatter(createdAnswer));
  } catch (err) {
    next(err);
  }
};

const createAnswers = async (
  question: Question,
  createdTypedAnswers: Array<TypedAnswer>,
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const createdAnswers: Array<Answer> = [];

    for (const createdTypedAnswer of createdTypedAnswers) {
      const createdAnswer = await createdTypedAnswer.createAnswer();
      createdAnswers.push(createdAnswer);

      await question.addAnswer(createdAnswer);
    }

    res.json(answerMapper(createdAnswers));
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

export const tryCreateExactAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedExactAnswers,
      error: validationError,
    }: {
      value: Array<ExactAnswerCreationAttributes>;
      error?: Error;
    } = arrayExactAnswerSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    const exactAnswersCount = await ExactAnswer.count({ where: { answerContent: validatedExactAnswers.map(({ answerContent }) => answerContent) } });
    if (exactAnswersCount > 0) return next(new DuplicationError('One of the answer'));

    const createdExactAnswers = await ExactAnswer.bulkCreate(validatedExactAnswers);

    await createAnswers(question, createdExactAnswers, req, res, next);
  } catch (err) {
    next(err);
  }
};

export const tryUpdateExactAnswer = async (req: Request, res: Response, next: NextFunction, answer: Answer): Promise<void> => {
  try {
    const answerId = req.params.answerId;
    if (!answerId) return next(new InvalidInputError());

    const {
      value: validatedExactAnswer,
      error: validationError,
    }: {
      value: ExactAnswerCreationAttributes;
      error?: Error;
    } = exactAnswerSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const exactAnswer = await answer.getExactAnswer();
    if (!exactAnswer) return next(new NotFoundError('Exact answer'));

    await exactAnswer.update(validatedExactAnswer);

    res.json({ updated: true });
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
    } = comparisonAnswerCreationSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    const [createdComparisonAnswer] = await ComparisonAnswer.findOrCreate({ where: validatedComparisonAnswer });

    await createAnswer(question, createdComparisonAnswer, req, res, next);
  } catch (err) {
    next(err);
  }
};

export const tryCreateComparisonAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedComparisonAnswers,
      error: validationError,
    }: {
      value: Array<ComparisonAnswerCreationAttributes>;
      error?: Error;
    } = arrayComparisonAnswerSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    const greaterThan = validatedComparisonAnswers.map(({ greaterThan }) => greaterThan);
    const lowerThan = validatedComparisonAnswers.map(({ greaterThan }) => greaterThan);

    const comparisonAnswersAmount = await ComparisonAnswer.count({ where: { greaterThan, lowerThan } });
    if (comparisonAnswersAmount > 0) return next(new DuplicationError('One of the comparison answer'));

    const createdComparisonAnswers = await ComparisonAnswer.bulkCreate(validatedComparisonAnswers);

    await createAnswers(question, createdComparisonAnswers, req, res, next);
  } catch (err) {
    next(err);
  }
};

export const tryUpdateComparisonAnswer = async (req: Request, res: Response, next: NextFunction, answer: Answer): Promise<void> => {
  try {
    const {
      value: validatedComparisonAnswer,
      error: validationError,
    }: {
      value: AllOptional<ComparisonAnswerCreationAttributes>;
      error?: Error;
    } = comparisonAnswerUpdateSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const comparisonAnswer = await answer.getComparisonAnswer();
    if (!comparisonAnswer) return next(new NotFoundError('Comparison answer'));

    if (validatedComparisonAnswer.greaterThan && validatedComparisonAnswer.lowerThan) {
      if (validatedComparisonAnswer.greaterThan >= validatedComparisonAnswer.lowerThan) return next(new InvalidInputError());
    }

    if (validatedComparisonAnswer.greaterThan) {
      if (validatedComparisonAnswer.greaterThan >= comparisonAnswer.lowerThan) return next(new InvalidInputError());
    }

    if (validatedComparisonAnswer.lowerThan) {
      if (validatedComparisonAnswer.lowerThan <= comparisonAnswer.greaterThan) return next(new InvalidInputError());
    }

    await comparisonAnswer.update(validatedComparisonAnswer);

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};
