import { Request, Response, NextFunction } from 'express';
import { verify, decode } from 'jsonwebtoken';

import StatusError from '../classes/StatusError';

import credentials from '../constants/credentials';

export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) return next(new StatusError('Invalid token', 403));
    
    const [_, token] = authorizationHeader.split(' ');
    if (!token) return next(new StatusError('Invalid token', 403));

    const isValid = verify(token, credentials.JWT_TOKEN);
    if (!isValid) return next(new StatusError('Invalid token', 403));

    const tokenData = decode(token);
    res.locals.jwt = tokenData;

    next();
  } catch (err) {
    next(err);
  }
};
