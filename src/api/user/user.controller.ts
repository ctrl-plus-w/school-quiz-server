import { NextFunction, Request, Response } from 'express';

import Joi from 'joi';
import bcrypt from 'bcrypt';

import { User } from '../../models/user';

import { DuplicationError, NotFoundError } from '../../classes/StatusError';

const schema = Joi.object({
  username: Joi.string().min(5).max(25).required(),
  firstName: Joi.string().min(5).max(25).required(),
  lastName: Joi.string().min(5).max(25).required(),
  password: Joi.string().min(7).max(35).required(),
  gender: Joi.boolean(),
});

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      username,
      firstName,
      lastName,
      password: plainPassword,
      gender,
    }: {
      username: string;
      firstName: string;
      lastName: string;
      password: string;
      gender: boolean | null;
    } = req.body;

    await schema.validateAsync(req.body);

    const user = await User.findOne({ where: { username: username } });
    if (user) return next(new DuplicationError('User'));

    const password = bcrypt.hashSync(plainPassword, 12);

    const createdUser = await User.create({ username, firstName, lastName, gender, password });
    res.json(createdUser);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return next(new NotFoundError('User'));

    await user.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
