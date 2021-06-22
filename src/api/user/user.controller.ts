import { Request, Response } from 'express';

import Joi from 'joi';
import bcrypt, { hashSync } from 'bcrypt';

import { User } from '../../models/user';

const schema = Joi.object({
  username: Joi.string().min(5).max(25).required(),
  firstName: Joi.string().min(5).max(25).required(),
  lastName: Joi.string().min(5).max(25).required(),
  password: Joi.string().min(7).max(35).required(),
  gender: Joi.boolean(),
});

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.findAll();
  res.json(users);
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.userId);
    res.json(user);
  } catch (err) {
    res.json({ error: 'Une erreur est servenue.' });
  }
};

export const createUser = async (req: Request, res: Response) => {
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
    if (user) throw new Error();

    const password = bcrypt.hashSync(plainPassword, 12);

    const createdUser = await User.create({ username, firstName, lastName, gender, password });
    res.json(createdUser);
  } catch (err) {
    res.json({ error: 'Une erreur est servenue.' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) throw new Error();

    await user.destroy();

    res.json({ deleted: true });
  } catch (err) {
    res.json({ error: 'Une erreur est servenue.' });
  }
};
