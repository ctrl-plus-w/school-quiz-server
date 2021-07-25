import { NextFunction, Request, Response } from 'express';

import Joi from 'joi';

import { Group, GroupCreationAttributes } from '../../models/group';
import { Label } from '../../models/label';

import { slugify } from '../../utils/string.utils';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

const schema = Joi.object({
  name: Joi.string().min(4).max(20).required(),
  slug: Joi.string().min(4).max(20).required(),
});

export const getGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

export const getGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    if (!group) return next(new NotFoundError('Group'));

    res.json(group);
  } catch (err) {
    next(err);
  }
};

export const getGroupLabels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Fetch the label from the getLabels() method.
    const group = await Group.findByPk(req.params.groupId, { include: Label });
    if (!group) return next(new NotFoundError('Group'));

    res.json(group.labels);
  } catch (err) {
    next(err);
  }
};

export const getGroupLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const group = await Group.findByPk(req.params.groupId, { include: Label });
    if (!group) return next(new NotFoundError('Group'));

    // Fetch the label from the getLabels() method.
    const label = group.labels?.find((label) => label.id === parseInt(req.params.labelId));
    if (!label) return next(new NotFoundError('Label'));

    res.json(label);
  } catch (err) {
    next(err);
  }
};

export const createGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedGroup,
      error: validationError,
    }: {
      value: GroupCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const group = await Group.findOne({ where: { slug: validatedGroup.slug } });
    if (group) return next(new DuplicationError('Group'));

    const createdGroup = await Group.create(validatedGroup);
    res.json(createdGroup);
  } catch (err) {
    next(err);
  }
};

export const addLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const groupId = req.params.groupId;
    const labelId = req.body.labelId;
    if (!labelId || !groupId) return next(new InvalidInputError());

    const group = await Group.findByPk(groupId);
    if (!group) return next(new NotFoundError('Group'));

    const label = await Label.findByPk(labelId);
    if (!label) return next(new NotFoundError('Label'));

    await group.addLabel(label);

    res.json({ added: true });
  } catch (err) {
    next(err);
  }
};

export const deleteGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    if (!group) return next(new NotFoundError('Group'));

    await group.destroy();
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};

export const removeLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const groupId = req.params.groupId;
    const labelId = req.body.labelId;
    if (!labelId || !groupId) return next(new InvalidInputError());

    const group = await Group.findByPk(groupId);
    if (!group) return next(new NotFoundError('Group'));

    if (!group.labels?.some((label) => label.id === labelId)) return next(new NotFoundError('Label'));

    const label = await Label.findByPk(labelId);
    if (!label) return next(new NotFoundError('Label'));

    await group.removeLabel(label);

    res.json({ removed: true });
  } catch (err) {
    next(err);
  }
};
