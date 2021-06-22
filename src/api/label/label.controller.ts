import { Request, Response } from 'express';
import Joi from 'joi';

import { Label } from '../../models/label';
import { slugify } from '../../utils/string.utils';

const schema = Joi.object({
  name: Joi.string().min(4).max(20).required(),
});

export const getLabels = async (req: Request, res: Response) => {
  const labels = await Label.findAll();
  res.json(labels);
};

export const getLabel = async (req: Request, res: Response) => {
  try {
    const label = await Label.findByPk(req.params.labelId);
    res.json(label);
  } catch (err) {
    res.json({ error: 'Une erreur est servenue.' });
  }
};

export const createLabel = async (req: Request, res: Response) => {
  try {
    const name = req.body.name;
    if (!name) throw new Error();

    const slug = slugify(name);

    await schema.validateAsync({ name: name });

    const label = await Label.findOne({ where: { slug: slug } });
    if (label) throw new Error();

    const createdLabel = await Label.create({ name, slug });
    res.json(createdLabel);
  } catch (err) {
    console.log(err);
    res.json({ error: 'Une erreur est servenue.' });
  }
};

export const deleteLabel = async (req: Request, res: Response) => {
  try {
    const label = await Label.findByPk(req.params.labelId);
    if (!label) throw new Error();

    await label.destroy();

    res.json({ deleted: true });
  } catch (err) {
    res.json({ error: 'Une erreur est servenue.' });
  }
};
