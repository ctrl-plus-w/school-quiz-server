import { Request, Response, NextFunction } from 'express';
import { sign, SignOptions } from 'jsonwebtoken';

import bcrypt from 'bcrypt';

import { User } from '../../models/user';
import { Role } from '../../models/role';

import credentials from '../../constants/credentials';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await User.findOne({ where: { username }, include: Role });
    if (!user) throw new Error();

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new Error();

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
  } catch (error) {
    res.status(400).json({ message: "Le nom d'utilisateur ou le mot de passe est invalide." });
  }
};
