import { NextFunction, Request, Response } from 'express';

import Joi from 'joi';

import { Group } from '../../models/group';
import { Label } from '../../models/label';

import { slugify } from '../../utils/string.utils';

import StatusError from '../../classes/StatusError';

const schema = Joi.object({
  name: Joi.string().min(4).max(20).required(),
});

export const getGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

export const getGroupLabels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    res.json(group?.labels);
  } catch (err) {
    next(err);
  }
};

export const getGroupLabel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    res.json(group?.labels?.find((label) => label.id === parseInt(req.params.labelId)));
  } catch (err) {
    next(err);
  }
};

export const getGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    res.json(group);
  } catch (err) {
    next(err);
  }
};

export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = req.body.name;
    if (!name) return next(new StatusError('One of the parameter is invalid', 422));

    const slug = slugify(name);

    await schema.validateAsync({ name: name }).catch(() => {
      next(new StatusError('One of the parameter is invalid', 422));
    });

    const group = await Group.findOne({ where: { slug } });
    if (group) return next(new StatusError('Group already exists', 409));

    const createdGroup = await Group.create({ name, slug });
    res.json(createdGroup);
  } catch (err) {
    next(err);
  }
};

export const addLabel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groupId = req.params.groupId;
    const labelId = req.body.labelId;
    if (!labelId || !groupId) return next(new StatusError('One of the parameter is invalid', 422));

    const group = await Group.findByPk(groupId);
    if (!group) return next(new StatusError('Group not found', 404));

    const label = await Label.findByPk(labelId);
    if (!label) return next(new StatusError('Label not found', 404));

    await group.addLabel(label);

    res.json({ added: true });
  } catch (err) {
    next(err);
  }
};

export const deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    if (!group) return next(new StatusError('Group not found', 404));

    await group.destroy();
    res.json({ deleted: true });
  } catch (err) {
    res.json({ error: 'Une erreur est servenue.' });
  }
};

export const removeLabel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groupId = req.params.groupId;
    const labelId = req.body.labelId;
    if (!labelId || !groupId) return next(new StatusError('One of the parameter is invalid', 422));

    const group = await Group.findByPk(groupId);
    if (!group) return next(new StatusError('Group not found', 404));

    const label = await Label.findByPk(labelId);
    if (!label) return next(new StatusError('Label not found', 404));

    await group.removeLabel(label);

    res.json({ removed: true });
  } catch (err) {
    next(err);
  }
};
