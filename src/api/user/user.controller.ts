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

import { userFormatter, userMapper } from '../../helpers/mapper.helper';
import roles from '../../constants/roles';

const schema = Joi.object({
  username: Joi.string().min(5).max(25).required(),
  firstName: Joi.string().min(5).max(25).required(),
  lastName: Joi.string().min(5).max(25).required(),
  password: Joi.string().min(7).max(35).required(),
  gender: Joi.boolean().allow(null),
});

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const loggedInUserPermission = res.locals.jwt.rolePermission;
    const isAdmin = loggedInUserPermission === roles.ADMIN.PERMISSION;

    const users = await User.findAll();
    res.json(userMapper(users, isAdmin ? 2 : 3));
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const loggedInUserPermission = res.locals.jwt.rolePermission;
    const isAdmin = loggedInUserPermission === roles.ADMIN.PERMISSION;

    const user = await User.findByPk(req.params.userId, {
      include: [Event, Group, Role, State, Quiz],
    });

    res.json(userFormatter(user, isAdmin ? 0 : 1));
  } catch (err) {
    next(err);
  }
};

export const getGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { include: Group });
    if (!user) return next(new NotFoundError('User'));

    res.json(user.groups);
  } catch (err) {
    next(err);
  }
};

export const getGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    if (!userId || !groupId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { include: Group });
    if (!user) return next(new NotFoundError('User'));

    const group = user.groups?.find((group) => group.id === +groupId);
    if (!group) return next(new NotFoundError('Group'));

    res.json(group);
  } catch (err) {
    next(err);
  }
};

export const getRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (!userId) return next(new InvalidInputError());

    const user = await User.findByPk(userId, { include: Role });
    if (!user) return next(new NotFoundError('User'));

    res.json(user.role);
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
    } = schema.validate(req.body);

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

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.userId);
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
