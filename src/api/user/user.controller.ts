import { NextFunction, Request, Response } from 'express';

import Joi from 'joi';
import bcrypt from 'bcrypt';

import { User, UserCreationAttributes } from '../../models/user';
import { Group } from '../../models/group';
import { Role } from '../../models/role';
import { Quiz } from '../../models/quiz';
import { State } from '../../models/state';
import { Event } from '../../models/event';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { eventFormatter, eventMapper, quizFormatter, quizMapper, userFormatter, userMapper } from '../../helpers/mapper.helper';

import { AllOptional } from '../../types/optional.types';
import { checkIsAdmin } from '../../middlewares/authorization.middleware';

const creationSchema = Joi.object({
  username: Joi.string().min(5).max(25).required(),
  firstName: Joi.string().min(5).max(25).required(),
  lastName: Joi.string().min(5).max(25).required(),
  password: Joi.string().min(7).max(35).required(),
  gender: Joi.boolean().allow(null),
});

const updateSchema = Joi.object({
  username: Joi.string().min(5).max(25),
  firstName: Joi.string().min(5).max(25),
  lastName: Joi.string().min(5).max(25),
  password: Joi.string().min(7).max(35),
  gender: Joi.boolean().allow(null),
}).min(1);

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [isAdmin] = await checkIsAdmin(req, res, next);

    const users = await User.findAll();
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

    const user = await User.findByPk(userId, { include: [Event, Group, Role, State, Quiz] });

    if (!user) return next(new NotFoundError('User'));

    res.json(userFormatter(user, isAdmin ? 0 : 1));
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

    const quizzes = await user.getQuizzes();
    res.json(quizMapper(quizzes));
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

    const [quizz] = await user.getQuizzes({ where: { id: quizId } });
    if (quizz) return next(new NotFoundError('Quiz'));

    res.json(quizFormatter(quizz));
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

    const events = await user.getEvents();
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

    const [event] = await user.getEvents({ where: { id: eventId } });
    if (!event) return next(new NotFoundError('Event'));

    res.json(eventFormatter(event));
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

    const user = await User.findOne({ where: { username: validatedUser.username } });
    if (user) return next(new DuplicationError('User'));

    const password = bcrypt.hashSync(validatedUser.password, 12);

    const createdUser = await User.create({ ...validatedUser, password });
    res.json(userFormatter(createdUser, 2));
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
    const groupId = req.body.groupId;
    if (!userId || !groupId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { include: Group });
    if (!user) return next(new NotFoundError('User'));

    if (user.groups?.some((group) => group.id === groupId)) return next(new DuplicationError('Group'));

    const group = await Group.findByPk(groupId);
    if (!group) return next(new NotFoundError('Group'));

    await user.addGroup(group);

    res.json({ added: true });
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

    res.json({ set: true });
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

    res.json({ set: true });
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
    const groupId = req.body.groupId;
    if (!userId || !groupId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { include: Group });
    if (!user) return next(new NotFoundError('User'));

    if (!user.groups?.some((group) => group.id === groupId)) return next(new NotFoundError('Group'));

    const group = await Group.findByPk(groupId);
    if (!group) return next(new NotFoundError('Group'));

    await user.removeGroup(group);

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
