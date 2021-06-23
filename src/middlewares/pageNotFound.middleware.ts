import { Request, Response, NextFunction } from 'express';

import StatusError from '../classes/StatusError';

export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  next(new StatusError('Page not found !', 404));
};
