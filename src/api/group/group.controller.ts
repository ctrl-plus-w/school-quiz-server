import { Request, Response, NextFunction } from 'express';
import { Group } from '../../models/group';

export const getGroups = async (req: Request, res: Response, next: NextFunction) => {
  const groups = await Group.findAll();
  res.json(groups);
};
