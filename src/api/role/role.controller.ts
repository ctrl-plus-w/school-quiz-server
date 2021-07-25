import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { Role, RoleCreationAttributes } from '../../models/role';

import { slugify } from '../../utils/string.utils';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

const schema = Joi.object({
  name: Joi.string().min(4).max(25).required(),
  slug: Joi.string().min(4).max(25).required(),
  permission: Joi.number().positive().required(),
});

export const getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (err) {
    next(err);
  }
};

export const getRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = await Role.findByPk(req.params.roleId);
    if (!role) return next(new NotFoundError('Role'));

    res.json(role);
  } catch (err) {
    next(err);
  }
};

export const createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedRole,
      error: validationError,
    }: {
      value: RoleCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const role = await Role.findOne({ where: { slug: validatedRole.slug } });
    if (role) return next(new DuplicationError('Role'));

    const createdRole = await Role.create(validatedRole);
    res.json(createdRole);
  } catch (err) {
    next(err);
  }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.roleId;
    if (!id) return next(new InvalidInputError());

    const role = await Role.findByPk(id);
    if (!role) return next(new NotFoundError('Role'));

    await role.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
