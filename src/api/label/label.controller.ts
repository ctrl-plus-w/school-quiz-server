import { NextFunction, Request, Response } from 'express';

import Joi from 'joi';

import { Label, LabelCreationAttributes } from '../../models/label';
import { slugify } from '../../utils/string.utils';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

const schema = Joi.object({
  name: Joi.string().min(4).max(20).required(),
  slug: Joi.string().min(4).max(20).required(),
});

export const getLabels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const labels = await Label.findAll();
    res.json(labels);
  } catch (err) {
    next(err);
  }
};

export const getLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const labelId = req.params.labelId;
    if (!labelId) return next(new InvalidInputError());

    const label = await Label.findByPk(labelId);
    if (!label) return next(new NotFoundError('Label'));

    res.json(label);
  } catch (err) {
    next(err);
  }
};

export const createLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedLabel,
      error: validationError,
    }: {
      value: LabelCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const labels = await Label.count({ where: { slug: validatedLabel.slug } });
    if (labels > 0) return next(new DuplicationError('Label'));

    const createdLabel = await Label.create(validatedLabel);
    res.json(createdLabel);
  } catch (err) {
    next(err);
  }
};

export const updateLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const labelId = req.params.labelId;
    if (!labelId) return next(new InvalidInputError());

    const {
      value: validatedLabel,
      error: validationError,
    }: {
      value: LabelCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const label = await Label.findByPk(labelId);
    if (!label) return next(new NotFoundError('Label'));

    const labels = await Label.count({ where: { slug: validatedLabel.slug } });
    if (labels > 0) return next(new DuplicationError('Label'));

    await label.update(validatedLabel);

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};

export const deleteLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const labelId = req.params.labelId;
    if (!labelId) return next(new InvalidInputError());

    const label = await Label.findByPk(labelId);
    if (!label) return next(new NotFoundError('Label'));

    await label.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
