import { Request, Response } from 'express';

import Joi from 'joi';

import { Group } from '../../models/group';
import { Label } from '../../models/label';

import { slugify } from '../../utils/string.utils';

const schema = Joi.object({
  name: Joi.string().min(4).max(20).required(),
});

export const getGroups = async (req: Request, res: Response) => {
  const groups = await Group.findAll();
  res.json(groups);
};

export const getGroupLabels = async (req: Request, res: Response) => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    res.json(group?.labels);
  } catch (err) {
    res.json({ error: 'Une erreur est servenue.' });
  }
};

export const getGroupLabel = async (req: Request, res: Response) => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    res.json(group?.labels?.find((label) => label.id === parseInt(req.params.labelId)));
  } catch (err) {
    res.json({ error: 'Une erreur est servenue.' });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    res.json(group);
  } catch (err) {
    res.json({ error: 'Une erreur est servenue.' });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const name = req.body.name;
    if (!name) throw new Error();

    const slug = slugify(name);

    await schema.validateAsync({ name: name });

    const group = await Group.findOne({ where: { slug } });
    if (group) throw new Error();

    const createdGroup = await Group.create({ name, slug });
    res.json(createdGroup);
  } catch (err) {
    res.json({ error: "Un des champs n'est pas valide." });
  }
};

export const addLabel = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.groupId;
    const labelId = req.body.labelId;
    if (!labelId || !groupId) throw new Error();

    const group = await Group.findByPk(groupId);
    if (!group) throw new Error();

    const label = await Label.findByPk(labelId);
    if (!label) throw new Error();

    await group.addLabel(label);

    res.json({ added: true });
  } catch (err) {
    console.log(err);
    res.json({ error: "Un des champs n'est pas valide." });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const group = await Group.findByPk(req.params.groupId);
    if (!group) throw new Error();

    await group.destroy();
    res.json({ deleted: true });
  } catch (err) {
    res.json({ error: 'Une erreur est servenue.' });
  }
};
