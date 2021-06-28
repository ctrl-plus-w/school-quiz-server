import { NextFunction, Request, Response } from 'express';

import Joi from 'joi';

import { VerificationType, VerificationTypeCreationAttributes } from '../../models/verificationType';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { slugify } from '../../utils/string.utils';

const schema = Joi.object({
  name: Joi.string().min(4).max(20).required(),
  slug: Joi.string().min(4).max(20).required(),
});

export const getVerificationTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const verificationTypes = await VerificationType.findAll();
    res.json(verificationTypes);
  } catch (err) {
    next(err);
  }
};

export const getVerificationType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const verificationType = await VerificationType.findByPk(req.params.verificationTypeId);
    res.json(verificationType);
  } catch (err) {
    next(err);
  }
};

export const createVerificationType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedVerificationType,
      error: validationError,
    }: {
      value: VerificationTypeCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const verificationType = await VerificationType.findOne({ where: { slug: validatedVerificationType.slug } });
    if (verificationType) return next(new DuplicationError('VerificationType'));

    const createdVerificationType = await VerificationType.create(validatedVerificationType);
    res.json(createdVerificationType);
  } catch (err) {
    next(err);
  }
};

export const deleteVerificationType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const verificationType = await VerificationType.findByPk(req.params.verificationTypeId);
    if (!verificationType) return next(new NotFoundError('VerificationType'));

    await verificationType.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};