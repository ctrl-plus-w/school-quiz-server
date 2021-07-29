import { Request, Response, NextFunction } from 'express';
import { verify, decode } from 'jsonwebtoken';

import StatusError from '../classes/StatusError';

import credentials from '../constants/credentials';

export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) throw new Error();

    const [_, token] = authorizationHeader.split(' ');
    if (!token) throw new Error();

    const isValid = verify(token, credentials.JWT_TOKEN);
    if (!isValid) throw new Error();

    const tokenData = decode(token);
    res.locals.jwt = tokenData;

    next();
  } catch (err) {
    next(new StatusError('Invalid token', 403));
  }
};
