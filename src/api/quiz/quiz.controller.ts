import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { Quiz, QuizCreationAttributes } from '../../models/quiz';
import { Question } from '../../models/question';
import { User } from '../../models/user';
import { Role } from '../../models/role';

import {
  DuplicationError,
  ForbiddenAccessParameterError,
  InvalidInputError,
  ModelRoleDuplicationError,
  NotFoundError,
} from '../../classes/StatusError';

import { slugify } from '../../utils/string.utils';

import { quizFormatter, quizMapper, userFormatter, userMapper } from '../../helpers/mapper.helper';

import roles from '../../constants/roles';
import { AllOptional } from '../../types/optional.types';

const creationSchema = Joi.object({
  title: Joi.string().min(1).max(25).required(),
  slug: Joi.string().min(1).max(25).required(),
  description: Joi.string().min(1).max(120).required(),
  strict: Joi.boolean().required(),
  shuffle: Joi.boolean().required(),
});

const updateSchema = Joi.object({
  title: Joi.string().min(1).max(25),
  description: Joi.string().min(1).max(120),
  strict: Joi.boolean(),
  shuffle: Joi.boolean(),
}).min(1);

export const getQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.query.userId as string | null;

    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) return next(new NotFoundError('User'));

      const userOwnedQuizzes = await user.getOwnedQuizzes();
      const userCollaboratedQuizzes = await user.getCollaboratedQuizzes();

      res.json(quizMapper([...userOwnedQuizzes, ...userCollaboratedQuizzes]));
    } else {
      const quizzes = await Quiz.findAll();
      res.json(quizMapper(quizzes));
    }
  } catch (err) {
    next(err);
  }
};

export const getQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quizId = req.params.quizId;
    if (!quizId) return next(new InvalidInputError());

    const quiz = await Quiz.findByPk(quizId, { include: [Question] });
    if (!quiz) return next(new NotFoundError('Quiz'));

    const owner = await quiz?.getOwner();
    const collaborators = await quiz?.getCollaborators();

    res.json(quizFormatter(quiz, owner, collaborators));
  } catch (err) {
    next(err);
  }
};

export const getQuizOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const owner = await quiz.getOwner();
    res.json(userFormatter(owner));
  } catch (err) {
    next(err);
  }
};

export const getQuizCollaborators = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const collaborators = await quiz.getCollaborators();
    res.json(userMapper(collaborators));
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

    const [collaborator] = await quiz.getCollaborators({ where: { id: userId } });
    if (!collaborator) return next(new NotFoundError('Collaborator'));

    res.json(userFormatter(collaborator));
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
    } = creationSchema.validate({ ...req.body, slug: slugify(req.body.title) });

    if (validationError) return next(new InvalidInputError());

    const quizzes = await Quiz.count({ where: { slug: validatedQuiz.slug } });
    if (quizzes > 0) return next(new DuplicationError('Quiz'));

    const user = await User.findByPk(res.locals.jwt.userId);
    if (!user) return next(new NotFoundError('User'));

    const createdQuiz = await Quiz.create(validatedQuiz);

    await createdQuiz.setOwner(user);

    res.json(quizFormatter(createdQuiz));
  } catch (err) {
    next(err);
  }
};

export const updateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quizId = req.params.quizId;
    if (!quizId) return next(new InvalidInputError());

    const {
      value: validatedQuiz,
      error: validationError,
    }: {
      value: AllOptional<QuizCreationAttributes>;
      error?: Error;
    } = updateSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) return next(new NotFoundError('Quiz'));

    if (validatedQuiz.title) {
      const slug = slugify(validatedQuiz.title);

      const quizzes = await Quiz.count({ where: { slug } });
      if (quizzes > 0) return next(new DuplicationError('Quiz'));

      await quiz.update({ ...validatedQuiz, slug });
    } else {
      await quiz.update(validatedQuiz);
    }

    res.json({ updated: true });
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

    if (quiz.ownerId === userId) return next(new ModelRoleDuplicationError());

    const collaboratorsWithSameId = await quiz.countCollaborators({ where: { id: userId } });
    if (collaboratorsWithSameId > 0) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { include: { model: Role }, attributes: ['id'] });

    if (!user) return next(new NotFoundError('User'));
    if (!user.role) return next(new NotFoundError('Role'));

    if (user.role.permission > roles.PROFESSOR.PERMISSION) return next(new ForbiddenAccessParameterError());

    await quiz.addCollaborator(user);

    res.json({ updated: true });
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
