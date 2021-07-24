import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { VerificationType } from '../models/verificationType';
import { Question, TypedQuestion } from '../models/question';
import { Quiz } from '../models/quiz';

import { ChoiceQuestion, ChoiceQuestionCreationAttributes } from '../models/choiceQuestion';
import { NumericQuestion, NumericQuestionCreationAttributes } from '../models/numericQuestion';
import { TextualQuestion, TextualQuestionCreationAttributes } from '../models/textualQuestion';

import { DuplicationError, InvalidInputError, NotFoundError } from '../classes/StatusError';

import { questionFormatter } from './mapper.helper';

import { slugify } from '../utils/string.utils';

const questionSchema: Joi.SchemaMap = {
  title: Joi.string().min(5).max(35).required(),
  slug: Joi.string().min(5).max(35).required(),
  description: Joi.string().min(3).max(120).required(),
};

const textualQuestionSchema = Joi.object({
  ...questionSchema,

  verificationType: Joi.string().required(),

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

type TextualQuestionIntersection = Question & TextualQuestionCreationAttributes & { verificationType: string };
type NumericQuestionIntersection = Question & NumericQuestionCreationAttributes;
type ChoiceQuestionIntersection = Question & ChoiceQuestionCreationAttributes;

const createQuestion = async (
  createdTypedQuestion: TypedQuestion,
  validatedSchema: TextualQuestionIntersection | NumericQuestionIntersection | ChoiceQuestionIntersection,
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<Question | undefined> => {
  try {
    const createdQuestion = await createdTypedQuestion.createQuestion({
      title: validatedSchema.title,
      slug: validatedSchema.slug,
      description: validatedSchema.description,
    });

    return createdQuestion;
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

    const quiz: Quiz = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const verificationType = await VerificationType.findOne({
      where: { slug: validatedTextualQuestion.verificationType },
    });
    if (!verificationType) return next(new NotFoundError('Verification type'));

    const createdTextualQuestion = await TextualQuestion.create({
      accentSensitive: validatedTextualQuestion.accentSensitive,
      caseSensitive: validatedTextualQuestion.caseSensitive,
    });

    const createdQuestion = await createQuestion(createdTextualQuestion, validatedTextualQuestion, req, res, next);
    if (!createdQuestion) return next(new Error());

    const fetchedCreatedQuestion = await Question.findByPk(createdQuestion.id);
    if (!fetchedCreatedQuestion) return next(new Error());

    await fetchedCreatedQuestion?.textualQuestion?.setVerificationType(verificationType);
    await quiz.addQuestion(fetchedCreatedQuestion);

    res.json(questionFormatter(createdQuestion));
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

    const quiz: Quiz = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const question = await Question.findOne({ where: { slug: validatedNumericQuestion.slug } });
    if (question) return next(new DuplicationError('Question'));

    const createdNumericQuestion = await NumericQuestion.create();

    const createdQuestion = await createQuestion(createdNumericQuestion, validatedNumericQuestion, req, res, next);
    if (!createdQuestion) return next(new Error());

    await quiz.addQuestion(createdQuestion);

    res.json(questionFormatter(createdQuestion));
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

    const quiz: Quiz = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const question = await Question.findOne({ where: { slug: validatedChoiceQuestion.slug } });

    if (question) return next(new DuplicationError('Question'));

    const createdChoiceQuestion = await ChoiceQuestion.create({
      shuffle: validatedChoiceQuestion.shuffle,
    });

    const createdQuestion = await createQuestion(createdChoiceQuestion, validatedChoiceQuestion, req, res, next);
    if (!createdQuestion) return next(new Error());

    await quiz.addQuestion(createdQuestion);

    res.json(questionFormatter(createdQuestion));
  } catch (err) {
    next(err);
  }
};
