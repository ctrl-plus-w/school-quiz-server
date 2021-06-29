import { Request, Response, NextFunction } from 'express';
import { sign, SignOptions } from 'jsonwebtoken';

import bcrypt from 'bcrypt';

import { User } from '../../models/user';
import { Role } from '../../models/role';

import { InvalidCredentialsError } from '../../classes/StatusError';

import credentials from '../../constants/credentials';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({ where: { username }, include: Role });
    if (!user) return next(new InvalidCredentialsError());

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return next(new InvalidCredentialsError());

    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role?.slug,
      rolePermission: user.role?.permission,
    };

    const options: SignOptions = {
      expiresIn: '1h',
    };

    const token = sign(payload, credentials.JWT_TOKEN, options);

    res.json({ token });
  } catch (err) {
    next(err);
  }
};
