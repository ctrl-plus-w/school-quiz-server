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

export const getQuizOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const owner = await quiz.getOwner();
    res.json(owner);
  } catch (err) {
    next(err);
  }
};

export const getQuizCollaborators = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const collaborators = await quiz.getCollaborators();
    res.json(collaborators);
  } catch (err) {
    next(err);
  }
};

export const getQuizCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.collaboratorId;
    if (!userId) return next(new InvalidInputError());

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const collaborators = await quiz.getCollaborators();
    res.json(collaborators.find((user) => user.id === parseInt(userId)));
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

export const addCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.body.userId;
    if (!userId) return next(new InvalidInputError());

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) return next(new NotFoundError('User'));

    await quiz.addCollaborator(user);

    res.json({ added: true });
  } catch (err) {
    console.log(err);
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

export const removeCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.collaboratorId;
    if (!userId) return next(new InvalidInputError());

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) return next(new NotFoundError('User'));

    const quizCollaborators = await quiz.getCollaborators({ attributes: ['id'] });

    if (!quizCollaborators || !quizCollaborators.some((collaborator) => collaborator.id === parseInt(userId)))
      return next(new NotFoundError('Collaborators'));

    await quiz.removeCollaborator(user);

    res.json({ removed: true });
  } catch (err) {
    next(err);
  }
};
