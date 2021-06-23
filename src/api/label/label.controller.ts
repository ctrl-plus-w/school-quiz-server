import { NextFunction, Request, Response } from 'express';

import Joi from 'joi';

import { Label } from '../../models/label';
import { slugify } from '../../utils/string.utils';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

const schema = Joi.object({
  name: Joi.string().min(4).max(20).required(),
});

export const getLabels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const labels = await Label.findAll();
    res.json(labels);
  } catch (err) {
    next(err);
  }
};

export const getLabel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const label = await Label.findByPk(req.params.labelId);
    res.json(label);
  } catch (err) {
    next(err);
  }
};

export const createLabel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = req.body.name;
    if (!name) return next(new InvalidInputError());

    const slug = slugify(name);

    await schema.validateAsync({ name: name }).catch(() => {
      return next(new InvalidInputError());
    });

    const label = await Label.findOne({ where: { slug: slug } });
    if (label) return next(new DuplicationError('Label'));

    const createdLabel = await Label.create({ name, slug });
    res.json(createdLabel);
  } catch (err) {
    next(err);
  }
};

export const deleteLabel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const label = await Label.findByPk(req.params.labelId);
    if (!label) return next(new NotFoundError('Label'));

    await label.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
