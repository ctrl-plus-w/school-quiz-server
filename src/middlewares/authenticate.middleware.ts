import { Request, Response, NextFunction } from 'express';
import { verify, decode } from 'jsonwebtoken';

import credentials from '../constants/credentials';

export default (req: Request, res: Response, next: NextFunction) => {
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
    res.json({
      message: 'Vous identifiants sont invalides.',
    });
  }
};
