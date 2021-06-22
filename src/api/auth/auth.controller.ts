import { Request, Response, NextFunction } from 'express';
import { sign, SignOptions } from 'jsonwebtoken';

import bcrypt from 'bcrypt';

import { User } from '../../models/user';
import { Role } from '../../models/role';

import StatusError from '../../classes/StatusError';

import credentials from '../../constants/credentials';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({ where: { username }, include: Role });
    if (!user) return next(new StatusError('The username or the password is invalid.', 422));

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!user) return next(new StatusError('The username or the password is invalid.', 422));

    const payload = {
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
