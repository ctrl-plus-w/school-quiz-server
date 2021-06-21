import { NextFunction, Request, Response } from 'express';

export default (permission: number) => (_req: Request, res: Response, next: NextFunction) => {
  try {
    if (!res.locals.jwt || !res.locals.jwt.rolePermission) throw new Error();
    if (res.locals.jwt.rolePermission > permission) throw new Error();

    next();
  } catch (err) {
    res.json({ error: "Vous n'avez pas les permissions nécessaire." });
  }
};
