import { Request, Response, NextFunction } from 'express';

import StatusError from '../classes/StatusError';

export default (req: Request, res: Response, next: NextFunction) => {
  next(new StatusError('Page not found !', 404));
};
