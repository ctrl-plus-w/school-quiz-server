import { NextFunction, Request, Response } from 'express';

import StatusError from '../classes/StatusError';

export default (permission: number) =>
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!res.locals.jwt || !res.locals.jwt.rolePermission || res.locals.jwt.rolePermission > permission) {
        next(new StatusError('Access forbidden', 403));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
