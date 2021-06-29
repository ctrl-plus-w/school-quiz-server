import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { Quiz, QuizCreationAttributes } from '../../models/quiz';
import { Question } from '../../models/question';
import { User } from '../../models/user';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { slugify } from '../../utils/string.utils';
import { quizFormatter, quizMapper } from '../../helpers/mapper.helper';

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
    res.json(quizMapper(quizzes));
  } catch (err) {
    next(err);
  }
};

export const getQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quizId = req.params.quizId;
    if (!quizId) return next(new InvalidInputError());

    const quiz = await Quiz.findByPk(quizId, { include: [Question, User] });
    res.json(quizFormatter(quiz));
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

    const user = await User.findByPk(res.locals.jwt.userId);
    if (!user) return next(new NotFoundError('User'));

    const createdQuiz = await user.createQuiz(validatedQuiz);
    res.json(quizFormatter(createdQuiz));
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
