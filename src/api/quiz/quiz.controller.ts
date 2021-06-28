import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { Quiz, QuizCreationAttributes } from '../../models/quiz';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { slugify } from '../../utils/string.utils';
import { Question } from '../../models/question';

const schema = Joi.object({
  title: Joi.string().min(5).max(25).required(),
  slug: Joi.string().min(5).max(25).required(),
  description: Joi.string().min(3).max(120).required(),
  strict: Joi.boolean().required(),
  shuffle: Joi.boolean().required(),
});

export const getQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quizzes = await Quiz.findAll();
    res.json(quizzes);
  } catch (err) {
    next(err);
  }
};

export const getQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quizId = req.params.quizId;
    if (!quizId) return next(new InvalidInputError());

    const quiz = await Quiz.findByPk(quizId, { include: [Question] });
    res.json(quiz);
  } catch (err) {
    next(err);
  }
};

export const createQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedQuiz,
      error: validationError,
    }: {
      value: QuizCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.title) });

    if (validationError) return next(new InvalidInputError());

    const quiz = await Quiz.findOne({ where: { slug: validatedQuiz.slug } });
    if (quiz) return next(new DuplicationError('Quiz'));

    const createdQuiz = await Quiz.create(validatedQuiz);
    res.json(createdQuiz);
  } catch (err) {
    next(err);
  }
};

export const deleteQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quizId = req.params.quizId;
    if (!quizId) return next(new InvalidInputError());

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) return next(new NotFoundError('Quiz'));

    await quiz.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
