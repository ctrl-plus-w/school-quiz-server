import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { Question, TypedQuestion } from '../models/question';
import { Quiz } from '../models/quiz';

import { ChoiceQuestion, ChoiceQuestionCreationAttributes } from '../models/choiceQuestion';
import { NumericQuestion, NumericQuestionCreationAttributes } from '../models/numericQuestion';
import { TextualQuestion, TextualQuestionCreationAttributes } from '../models/textualQuestion';

import { DuplicationError, InvalidInputError, NotFoundError } from '../classes/StatusError';

import { questionFormatter } from './mapper.helper';

import { slugify } from '../utils/string.utils';

import { AllOptional } from '../types/optional.types';

/* Global schemas */
const questionCreationSchema: Joi.SchemaMap = {
  title: Joi.string().min(1).max(35).required(),
  slug: Joi.string().min(1).max(35).required(),
  description: Joi.string().min(1).max(120).required(),
};

const questionUpdateSchema: Joi.SchemaMap = {
  title: Joi.string().min(1).max(35),
  description: Joi.string().min(1).max(120),
};

/* Textual question schemas */
const textualQuestionCreationSchema = Joi.object({
  ...questionCreationSchema,

  accentSensitive: Joi.boolean().required(),
  caseSensitive: Joi.boolean().required(),
});

const textualQuestionUpdateSchema = Joi.object({
  ...questionUpdateSchema,

  accentSensitive: Joi.boolean(),
  caseSensitive: Joi.boolean(),
}).min(1);

/* Numeric question schemas */
const numericQuestionSchema = Joi.object({
  ...questionCreationSchema,
});

const numericQuestionUpdateSchema = Joi.object({
  ...questionUpdateSchema,
});

/* Choice question schemas */
const choiceQuestionCreationSchema = Joi.object({
  ...questionCreationSchema,

  shuffle: Joi.boolean().required(),
});

const choiceQuestionUpdateSchema = Joi.object({
  ...questionUpdateSchema,

  shuffle: Joi.boolean(),
});

type TextualQuestionIntersection = Question & TextualQuestionCreationAttributes & { verificationType: string };
type NumericQuestionIntersection = Question & NumericQuestionCreationAttributes;
type ChoiceQuestionIntersection = Question & ChoiceQuestionCreationAttributes;

const createQuestion = async (
  createdTypedQuestion: TypedQuestion,
  validatedSchema: NumericQuestionIntersection | NumericQuestionIntersection | ChoiceQuestionIntersection,
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
    } = textualQuestionCreationSchema.validate({ ...req.body, slug: slugify(req.body.title) });

    if (validationError) return next(new InvalidInputError());

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const questionsWithSameSlug = await quiz.countQuestions({ where: { slug: validatedTextualQuestion.slug } });
    if (questionsWithSameSlug > 0) return next(new DuplicationError('Question'));

    const createdTextualQuestion = await TextualQuestion.create({
      accentSensitive: validatedTextualQuestion.accentSensitive,
      caseSensitive: validatedTextualQuestion.caseSensitive,
    });

    const createdQuestion = await createQuestion(createdTextualQuestion, validatedTextualQuestion, req, res, next);
    if (!createdQuestion) return next(new Error());

    const fetchedCreatedQuestion = await Question.findByPk(createdQuestion.id);
    if (!fetchedCreatedQuestion) return next(new Error());

    await quiz.addQuestion(fetchedCreatedQuestion);

    res.json(questionFormatter(createdQuestion));
  } catch (err) {
    next(err);
  }
};

export const tryUpdateTextualQuestion = async (req: Request, res: Response, next: NextFunction, question: Question): Promise<void> => {
  try {
    const {
      value: validatedTextualQuestion,
      error: validationError,
    }: {
      value: AllOptional<TextualQuestionIntersection>;
      error?: Error;
    } = textualQuestionUpdateSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    if (validatedTextualQuestion.title) {
      const slug = slugify(validatedTextualQuestion.title);
      await question.update({ title: validatedTextualQuestion.title, description: validatedTextualQuestion.description, slug });
    } else if (validatedTextualQuestion.description) {
      await question.update({ description: validatedTextualQuestion.description });
    }

    const textualQuestion = await question.getTextualQuestion();
    if (!textualQuestion) return next(new NotFoundError('Question'));

    await textualQuestion.update({
      accentSensitive: validatedTextualQuestion.accentSensitive,
      caseSensitive: validatedTextualQuestion.caseSensitive,
    });

    res.json({ updated: true });
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

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const questionsWithSameSlug = await quiz.countQuestions({ where: { slug: validatedNumericQuestion.slug } });
    if (questionsWithSameSlug > 0) return next(new DuplicationError('Question'));

    const questions = await Question.count({ where: { slug: validatedNumericQuestion.slug } });
    if (questions > 0) return next(new DuplicationError('Question'));

    const createdNumericQuestion = await NumericQuestion.create();

    const createdQuestion = await createQuestion(createdNumericQuestion, validatedNumericQuestion, req, res, next);
    if (!createdQuestion) return next(new Error());

    await quiz.addQuestion(createdQuestion);

    res.json(questionFormatter(createdQuestion));
  } catch (err) {
    next(err);
  }
};

export const tryUpdateNumericQuestion = async (req: Request, res: Response, next: NextFunction, question: Question): Promise<void> => {
  try {
    const {
      value: validatedNumericQuestion,
      error: validationError,
    }: {
      value: AllOptional<NumericQuestionIntersection>;
      error?: Error;
    } = numericQuestionUpdateSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    if (validatedNumericQuestion.title) {
      const slug = slugify(validatedNumericQuestion.title);
      await question.update({ title: validatedNumericQuestion.title, description: validatedNumericQuestion.description, slug });
    } else if (validatedNumericQuestion.description) {
      await question.update({ description: validatedNumericQuestion.description });
    }

    res.json({ updated: true });
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
    } = choiceQuestionCreationSchema.validate({ ...req.body, slug: slugify(req.body.title) });

    if (validationError) return next(new InvalidInputError());

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const questionsWithSameSlug = await quiz.countQuestions({ where: { slug: validatedChoiceQuestion.slug } });
    if (questionsWithSameSlug > 0) return next(new DuplicationError('Question'));

    const questions = await Question.count({ where: { slug: validatedChoiceQuestion.slug } });
    if (questions > 0) return next(new DuplicationError('Question'));

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

export const tryUpdateChoiceQuestion = async (req: Request, res: Response, next: NextFunction, question: Question): Promise<void> => {
  try {
    const {
      value: validatedChoiceQuestion,
      error: validationError,
    }: {
      value: AllOptional<ChoiceQuestionIntersection>;
      error?: Error;
    } = choiceQuestionUpdateSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    if (validatedChoiceQuestion.title) {
      const slug = slugify(validatedChoiceQuestion.title);
      await question.update({ title: validatedChoiceQuestion.title, description: validatedChoiceQuestion.description, slug });
    } else if (validatedChoiceQuestion.description) {
      await question.update({ description: validatedChoiceQuestion.description });
    }

    const choiceQuestion = await question.getChoiceQuestion();
    if (!choiceQuestion) return next(new NotFoundError('Question'));

    await choiceQuestion.update({ shuffle: validatedChoiceQuestion.shuffle });

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};
