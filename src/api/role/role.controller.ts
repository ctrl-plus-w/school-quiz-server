import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { Role, RoleCreationAttributes } from '../../models/role';

import { slugify } from '../../utils/string.utils';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';
import { AllOptional } from '../../types/optional.types';

const creationSchema = Joi.object({
  name: Joi.string().min(4).max(25).required(),
  slug: Joi.string().min(4).max(25).required(),
  permission: Joi.number().positive().required(),
});

const updateSchema = Joi.object({
  name: Joi.string().min(4).max(25),
  permission: Joi.number().positive(),
}).min(1);

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
    const roleId = req.params.roleId;
    if (!roleId) return next(new InvalidInputError());

    const role = await Role.findByPk(roleId);
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
    } = creationSchema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const roles = await Role.count({ where: { slug: validatedRole.slug } });
    if (roles > 0) return next(new DuplicationError('Role'));

    const createdRole = await Role.create(validatedRole);
    res.json(createdRole);
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roleId = req.params.roleId;
    if (!roleId) return next(new InvalidInputError());

    const {
      value: validatedRole,
      error: validationError,
    }: {
      value: AllOptional<RoleCreationAttributes>;
      error?: Error;
    } = updateSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const role = await Role.findByPk(roleId);
    if (!role) return next(new NotFoundError('Role'));

    if (validatedRole.name && validatedRole.name !== role.name) {
      const slug = slugify(validatedRole.name);
      const roles = await Role.count({ where: { slug: slug } });
      if (roles > 0) return next(new DuplicationError('Role'));

      await role.update({ ...validatedRole, slug });
    } else {
      await role.update(validatedRole);
    }

    res.json({ updated: true });
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
