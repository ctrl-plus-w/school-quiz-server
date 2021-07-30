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
    const groupId = req.params.groupId;
    if (!groupId) return next(new InvalidInputError());

    const group = await Group.findByPk(groupId, { include: Label });
    if (!group) return next(new NotFoundError('Group'));

    res.json(group);
  } catch (err) {
    next(err);
  }
};

export const getGroupLabels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const groupId = req.params.groupId;
    if (!groupId) return next(new InvalidInputError());

    const group = await Group.findByPk(groupId);
    if (!group) return next(new NotFoundError('Group'));

    const labels = await group.getLabels();
    res.json(labels);
  } catch (err) {
    next(err);
  }
};

export const getGroupLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const labelId = req.params.labelId;
    const groupId = req.params.groupId;
    if (!labelId || !groupId) return next(new InvalidInputError());

    const group = await Group.findByPk(groupId);
    if (!group) return next(new NotFoundError('Group'));

    const [label] = await group.getLabels({ where: { id: labelId } });
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

    const groups = await Group.count({ where: { slug: validatedGroup.slug } });
    if (groups > 0) return next(new DuplicationError('Group'));

    const createdGroup = await Group.create(validatedGroup);
    res.json(createdGroup);
  } catch (err) {
    next(err);
  }
};

export const updateGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const groupId = req.params.groupId;
    if (!groupId) return next(new InvalidInputError());

    const {
      value: validatedGroup,
      error: validationError,
    }: {
      value: GroupCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const group = await Group.findByPk(groupId);
    if (!group) return next(new NotFoundError('Group'));

    const groups = await Group.count({ where: { slug: validatedGroup.slug } });
    if (groups > 0) return next(new DuplicationError('Group'));

    await group.update(validatedGroup);

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};

export const addLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const groupId = req.params.groupId;
    if (!groupId) return next(new InvalidInputError());

    const labelId = req.body.labelId;
    const labelIds = req.body.labelIds;

    if (!labelId && !labelIds) return next(new InvalidInputError());

    const group = await Group.findByPk(groupId);
    if (!group) return next(new NotFoundError('Group'));

    if (labelId) {
      const label = await Label.findByPk(labelId);
      if (!label) return next(new NotFoundError('Label'));

      await group.addLabel(label);
    } else if (labelIds) {
      const labels = await Label.findAll({ where: { id: labelIds } });
      if (labels.length !== labelIds.length) return next(new NotFoundError('Group'));

      await group.addLabels(labels);
    }

    res.json({ added: true });
  } catch (err) {
    next(err);
  }
};

export const deleteGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const groupId = req.params.groupId;
    if (!groupId) return next(new InvalidInputError());

    const group = await Group.findByPk(groupId);
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
