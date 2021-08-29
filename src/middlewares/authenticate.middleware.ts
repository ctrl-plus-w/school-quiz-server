import { Request, Response, NextFunction } from 'express';
import { verify, decode } from 'jsonwebtoken';

import StatusError from '../classes/StatusError';

import { IAuthPayload } from '../types/auth.types';

import CREDENTIALS from '../constants/credentials';
import ROLES from '../constants/roles';

export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) throw new Error();

    const [_, token] = authorizationHeader.split(' ');
    if (!token) throw new Error();

    const isValid = verify(token, CREDENTIALS.JWT_TOKEN);
    if (!isValid) throw new Error();

    const tokenData = decode(token) as IAuthPayload;
    res.locals.jwt = tokenData;

    res.locals.isAdmin = tokenData.rolePermission === ROLES.ADMIN.PERMISSION;
    res.locals.isProfessor = tokenData.rolePermission === ROLES.PROFESSOR.PERMISSION;
    res.locals.isStudent = tokenData.rolePermission === ROLES.STUDENT.PERMISSION;

    next();
  } catch (err) {
    next(new StatusError('Invalid token', 403));
  }
};
