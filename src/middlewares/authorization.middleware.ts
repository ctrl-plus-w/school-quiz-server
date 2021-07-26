import { NextFunction, Request, Response } from 'express';

import { AcccessForbiddenError, UnknownError } from '../classes/StatusError';

import { MiddlewareFunction, MiddlewareValidationPayload } from '../types/middlewares.types';

import roles from '../constants/roles';

export const authorize = (
  bypassedMiddlewares: Array<MiddlewareFunction>,
  middlewares: Array<MiddlewareFunction> = []
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      for (const middleware of middlewares) {
        const [validated, error] = await middleware(req, res, next);
        if (!validated) return next(error);
      }

      const isAdmin = await checkIsAdmin(req, res, next);
      if (isAdmin) return next();

      for (const middleware of bypassedMiddlewares) {
        const [validated, error] = await middleware(req, res, next);
        if (!validated) return next(error);
      }
    } catch (err) {
      next(err);
    }
  };
};

const checkPermission = (permission: number) => {
  return async (_req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
    try {
      const hasPermission =
        !res.locals.jwt || !res.locals.jwt.rolePermission || res.locals.jwt.rolePermission < permission;

      return hasPermission ? [true, null] : [false, new AcccessForbiddenError()];
    } catch (err) {
      return err instanceof Error ? [false, err] : [false, new UnknownError()];
    }
  };
};

export const checkIsAdmin = checkPermission(roles.ADMIN.PERMISSION);

export const checkIsProfessor = checkPermission(roles.PROFESSOR.PERMISSION);

export const checkIsStudent = checkPermission(roles.STUDENT.PERMISSION);

export default checkPermission;
