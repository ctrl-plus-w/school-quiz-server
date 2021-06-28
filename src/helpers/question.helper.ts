import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { Question, TypedQuestion } from '../models/question';

import { ChoiceQuestion, ChoiceQuestionCreationAttributes } from '../models/choiceQuestion';
import { NumericQuestion, NumericQuestionCreationAttributes } from '../models/numericQuestion';
import { TextualQuestion, TextualQuestionCreationAttributes } from '../models/textualQuestion';

import { DuplicationError, InvalidInputError } from '../classes/StatusError';

import { questionFormatter } from './mapper.helper';

import { slugify } from '../utils/string.utils';

const questionSchema: Joi.SchemaMap = {
  title: Joi.string().min(5).max(35).required(),
  slug: Joi.string().min(5).max(35).required(),
  description: Joi.string().min(3).max(120).required(),
};

const textualQuestionSchema = Joi.object({
  ...questionSchema,

  accentSensitive: Joi.boolean().required(),
  caseSensitive: Joi.boolean().required(),
});

const numericQuestionSchema = Joi.object({
  ...questionSchema,
});

const choiceQuestionSchema = Joi.object({
  ...questionSchema,

  shuffle: Joi.boolean().required(),
});

type TextualQuestionIntersection = Question & TextualQuestionCreationAttributes;
type NumericQuestionIntersection = Question & NumericQuestionCreationAttributes;
type ChoiceQuestionIntersection = Question & ChoiceQuestionCreationAttributes;

const createQuestion = async (
  createdTypedQuestion: TypedQuestion,
  validatedSchema: TextualQuestionIntersection | NumericQuestionIntersection | ChoiceQuestionIntersection,
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const createdQuestion = await createdTypedQuestion.createQuestion({
      title: validatedSchema.title,
      slug: validatedSchema.slug,
      description: validatedSchema.description,
    });

    res.json(questionFormatter(createdQuestion));
  } catch (err) {
    next(err);
  }
};

export const tryCreateTextualQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedTextualQuestion,
      error: validationError,
    }: {
      value: TextualQuestionIntersection;
      error?: Error;
    } = textualQuestionSchema.validate({ ...req.body, slug: slugify(req.body.title) });

    if (validationError) return next(new InvalidInputError());

    const question = await Question.findOne({ where: { slug: validatedTextualQuestion.slug } });
    if (question) return next(new DuplicationError('Question'));

    const createdTextualQuestion = await TextualQuestion.create({
      accentSensitive: validatedTextualQuestion.accentSensitive,
      caseSensitive: validatedTextualQuestion.caseSensitive,
    });

    return await createQuestion(createdTextualQuestion, validatedTextualQuestion, req, res, next);
  } catch (err) {
    next(err);
  }
};

export const tryCreateNumericQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedNumericQuestion,
      error: validationError,
    }: {
      value: NumericQuestionIntersection;
      error?: Error;
    } = numericQuestionSchema.validate({ ...req.body, slug: slugify(req.body.title) });

    if (validationError) return next(new InvalidInputError());

    const question = await Question.findOne({ where: { slug: validatedNumericQuestion.slug } });
    if (question) return next(new DuplicationError('Question'));

    const createdNumericQuestion = await NumericQuestion.create();

    await createQuestion(createdNumericQuestion, validatedNumericQuestion, req, res, next);
  } catch (err) {
    next(err);
  }
};

export const tryCreateChoiceQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedChoiceQuestion,
      error: validationError,
    }: {
      value: ChoiceQuestionIntersection;
      error?: Error;
    } = choiceQuestionSchema.validate({ ...req.body, slug: slugify(req.body.title) });

    if (validationError) return next(new InvalidInputError());

    const question = await Question.findOne({ where: { slug: validatedChoiceQuestion.slug } });

    if (question) return next(new DuplicationError('Question'));

    const createdChoiceQuestion = await ChoiceQuestion.create({
      shuffle: validatedChoiceQuestion.shuffle,
    });

    await createQuestion(createdChoiceQuestion, validatedChoiceQuestion, req, res, next);
  } catch (err) {
    next(err);
  }
};
