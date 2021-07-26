import { NextFunction, Request, Response } from 'express';

import { ErrorsUnion } from './error.types';

export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<MiddlewareValidationPayload>;

export type MiddlewareValidationPayload = [boolean, ErrorsUnion | null];
