import { NextFunction, Request, Response } from 'express';

import { AcccessForbiddenError, UnknownError } from '../classes/StatusError';

import { MiddlewareFunction, MiddlewareValidationPayload } from '../types/middlewares.types';

import ROLES from '../constants/roles';

export const authorize = (bypassedMiddlewares: Array<MiddlewareFunction>, middlewares: Array<MiddlewareFunction> = []) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [isAdmin] = await checkIsAdmin(req, res, next);

      for (const middleware of middlewares) {
        const [validated, error] = await middleware(req, res, next, isAdmin);
        if (!validated) return next(error);
      }

      for (const middleware of bypassedMiddlewares) {
        const [validated, error] = await middleware(req, res, next, isAdmin);
        if (!validated) return next(error);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

const checkPermission = (permission: number) => {
  return async (_req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
    try {
      const hasPermission = res.locals.jwt && res.locals.jwt.rolePermission && res.locals.jwt.rolePermission <= permission;
      return hasPermission ? [true, null] : [false, new AcccessForbiddenError()];
    } catch (err) {
      return err instanceof Error ? [false, err] : [false, new UnknownError()];
    }
  };
};

export const checkIsAdmin = checkPermission(ROLES.ADMIN.PERMISSION);

export const checkIsProfessor = checkPermission(ROLES.PROFESSOR.PERMISSION);

export const checkIsStudent = checkPermission(ROLES.STUDENT.PERMISSION);

export default checkPermission;
