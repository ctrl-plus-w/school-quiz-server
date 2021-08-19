import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';

import Joi from 'joi';
import bcrypt from 'bcrypt';

import { User, UserCreationAttributes } from '../../models/user';
import { Group } from '../../models/group';
import { Role } from '../../models/role';
import { State } from '../../models/state';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { eventFormatter, eventMapper, quizFormatter, quizMapper, userFormatter, userMapper } from '../../helpers/mapper.helper';

import { AllOptional } from '../../types/optional.types';
import { checkIsAdmin } from '../../middlewares/authorization.middleware';
import { Question } from '../../models/question';
import { Quiz } from '../../models/quiz';

const creationSchema = Joi.object({
  username: Joi.string().min(4).max(25).required(),
  firstName: Joi.string().min(3).max(25).required(),
  lastName: Joi.string().min(3).max(25).required(),
  password: Joi.string().min(5).max(35).required(),
  gender: Joi.boolean().allow(null),
});

const updateSchema = Joi.object({
  username: Joi.string().min(4).max(25),
  firstName: Joi.string().min(3).max(25),
  lastName: Joi.string().min(3).max(25),
  password: Joi.string().min(5).max(35),
  gender: Joi.boolean().allow(null),
}).min(1);

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [isAdmin] = await checkIsAdmin(req, res, next);

    const includes = req.query.role ? { model: Role, where: { slug: req.query.role }, attributes: [] } : undefined;
    const conditions = req.query.self === 'false' ? { id: { [Op.not]: res.locals.jwt.userId } } : undefined;

    const users = await User.findAll({ include: includes, where: conditions });
    res.json(userMapper(users, isAdmin ? 2 : 3));
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) return next(new InvalidInputError());

    const [isAdmin] = await checkIsAdmin(req, res, next);

    const user = await User.findByPk(userId, { include: [Group, Role, State] });
    if (!user) return next(new NotFoundError('User'));

    const userOwnedEvents = await user.getOwnedEvents();
    const userCollaboratedEvents = await user.getCollaboratedEvents();
    const userEvents = [...userOwnedEvents, ...userCollaboratedEvents];

    const userOwnedQuizzes = await user.getOwnedQuizzes();
    const userCollaboratedQuizzes = await user.getCollaboratedQuizzes();
    const userQuizzes = [...userOwnedQuizzes, ...userCollaboratedQuizzes];

    res.json(userFormatter(user, userQuizzes, userEvents, isAdmin ? 0 : 1));
  } catch (err) {
    next(err);
  }
};

export const getUserGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) return next(new NotFoundError('User'));

    const groups = await user.getGroups();
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

export const getUserGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    if (!userId || !groupId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) return next(new NotFoundError('User'));

    const [group] = await user.getGroups({ where: { id: groupId } });
    if (!group) return next(new NotFoundError('Group'));

    res.json(group);
  } catch (err) {
    next(err);
  }
};

export const getUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { attributes: ['id', 'roleId'] });
    if (!user) return next(new NotFoundError('User'));

    const role = await user.getRole();
    res.json(role);
  } catch (err) {
    next(err);
  }
};

export const getUserState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { attributes: ['id', 'stateId'] });
    if (!user) return next(new NotFoundError('User'));

    const state = await user.getState();
    res.json(state);
  } catch (err) {
    next(err);
  }
};

export const getUserQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) return next(new NotFoundError('User'));

    const userOwnedQuizzes = await user.getOwnedQuizzes();
    const userCollaboratedQuizzes = await user.getCollaboratedQuizzes();

    res.json(quizMapper([...userOwnedQuizzes, ...userCollaboratedQuizzes]));
  } catch (err) {
    next(err);
  }
};

export const getUserQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quizId = req.params.quizId;
    const userId = req.params.userId;
    if (!userId || !quizId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) return next(new NotFoundError('User'));

    const [userOwnedQuiz] = await user.getOwnedQuizzes({ where: { id: quizId }, include: [Question] });

    if (userOwnedQuiz) {
      const quizCollaborators = await userOwnedQuiz.getCollaborators();

      res.json(quizFormatter(userOwnedQuiz, user, quizCollaborators));
      return;
    }

    const [userCollaboratedQuiz] = await user.getCollaboratedQuizzes({ where: { id: quizId }, include: [Question] });

    if (userCollaboratedQuiz) {
      const quizOwner = await userCollaboratedQuiz.getOwner();
      const quizCollaborators = await userCollaboratedQuiz.getCollaborators();

      res.json(quizFormatter(userCollaboratedQuiz, quizOwner, quizCollaborators));
      return;
    }

    return next(new NotFoundError('Quiz'));
  } catch (err) {
    next(err);
  }
};

export const getUserEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) return next(new NotFoundError('User'));

    const events = await user.getOwnedEvents();
    res.json(eventMapper(events));
  } catch (err) {
    next(err);
  }
};

export const getUserEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.eventId;
    const userId = req.params.userId;
    if (!userId || !eventId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) return next(new NotFoundError('User'));

    const [event] = await user.getOwnedEvents({ where: { id: eventId }, include: [Quiz, Group] });
    if (!event) return next(new NotFoundError('Event'));

    const owner = await event.getOwner();
    const collaborators = await event.getCollaborators();

    res.json(eventFormatter(event, owner, collaborators));
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedUser,
      error: validationError,
    }: {
      value: UserCreationAttributes;
      error?: Error;
    } = creationSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const users = await User.count({ where: { username: validatedUser.username } });
    if (users) return next(new DuplicationError('User'));

    const password = bcrypt.hashSync(validatedUser.password, 12);

    const createdUser = await User.create({ ...validatedUser, password });
    res.json(userFormatter(createdUser, undefined, undefined, 2));
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) return next(new InvalidInputError());

    const user = await User.findByPk(userId);
    if (!user) return next(new NotFoundError('User'));

    const {
      value: validatedUser,
      error: validationError,
    }: {
      value: AllOptional<UserCreationAttributes>;
      error?: Error;
    } = updateSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    if (validatedUser.username) {
      const users = await User.count({ where: { username: validatedUser.username } });
      if (users > 0) return next(new DuplicationError('User'));
    }

    if (validatedUser.password) {
      const password = bcrypt.hashSync(validatedUser.password, 12);
      await user.update({ ...validatedUser, password });
    } else {
      await user.update(validatedUser);
    }

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};

export const addGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) return next(new InvalidInputError());

    const groupId = req.body.groupId;
    const groupIds = req.body.groupIds;

    if (!groupId && !groupIds) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { include: Group });
    if (!user) return next(new NotFoundError('User'));

    if (groupId) {
      if (user.groups?.some((group) => group.id === parseInt(groupId))) return next(new DuplicationError('Group'));

      const group = await Group.findByPk(groupId);
      if (!group) return next(new NotFoundError('Group'));

      await user.addGroup(group);
    } else if (groupIds) {
      if (!Array.isArray(groupIds) || groupIds.length === 0) return next(new InvalidInputError());

      if (user.groups?.some((group) => groupIds.includes(group.id.toString()))) return next(new DuplicationError('Group'));

      const groups = await Group.findAll({ where: { id: groupIds } });
      if (groups.length !== groupIds.length) return next(new NotFoundError('Group'));

      await user.addGroups(groups);
    }

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};

export const setRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    const roleId = req.body.roleId;
    if (!userId || !roleId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { include: Role });
    if (!user) return next(new NotFoundError('User'));

    if (user.role?.id === roleId) return next(new DuplicationError('Role'));

    const role = await Role.findByPk(roleId);
    if (!role) return next(new NotFoundError('Role'));

    await user.setRole(role);

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};

export const setState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    const stateId = req.body.stateId;
    if (!userId || !stateId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { include: State });
    if (!user) return next(new NotFoundError('User'));

    const actualState = await user.getState({ attributes: ['id'] });
    if (!actualState) return next(new NotFoundError('State'));

    if (actualState.id === stateId) return next(new DuplicationError('State'));

    const state = await State.findByPk(stateId);
    if (!state) return next(new NotFoundError('State'));

    await user.setState(state);

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) return next(new InvalidInputError());

    const user = await User.findByPk(userId);
    if (!user) return next(new NotFoundError('User'));

    await user.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};

export const removeGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    if (!userId || !groupId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { include: Group });
    if (!user) return next(new NotFoundError('User'));

    if (!user.groups?.some((group) => group.id === parseInt(groupId))) return next(new NotFoundError('Group'));

    const group = await Group.findByPk(groupId);
    if (!group) return next(new NotFoundError('Group'));

    await user.removeGroup(group);

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
