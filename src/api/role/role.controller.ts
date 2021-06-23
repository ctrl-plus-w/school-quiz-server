import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { Role } from '../../models/role';

import { slugify } from '../../utils/string.utils';

import StatusError from '../../classes/StatusError';

const schema = Joi.object({
  name: Joi.string().min(4).max(25).required(),
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
    res.json(role);
  } catch (err) {
    next(err);
  }
};

export const createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const name = req.body.name;
    const permission = req.body.permission;
    if (!name || !permission) return next(new StatusError('One of the parameter is invalid', 422));

    const slug = slugify(name);

    await schema.validateAsync({ name, permission }).catch(() => {
      return next(new StatusError('One of the parameter is invalid', 422));
    });

    const role = await Role.findOne({ where: { slug } });
    if (role) return next(new StatusError('Role already exists', 409));

    const createdRole = await Role.create({ name, slug, permission });
    res.json(createdRole);
  } catch (err) {
    next(err);
  }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.roleId;
    if (!id) return next(new StatusError('One of the parameter is invalid', 422));

    const role = await Role.findByPk(id);
    if (!role) return next(new StatusError('Role not found', 404));

    await role.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
