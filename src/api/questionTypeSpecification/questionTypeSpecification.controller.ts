import { NextFunction, Request, Response } from 'express';

import Joi from 'joi';

import {
  QuestionTypeSpecification,
  QuestionTypeSpecificationCreationAttributes,
} from '../../models/questionTypeSpecification';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { slugify } from '../../utils/string.utils';

const schema = Joi.object({
  name: Joi.string().min(4).max(20).required(),
  slug: Joi.string().min(4).max(20).required(),
});

export const getQuestionTypeSpecifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionTypeSpecifications = await QuestionTypeSpecification.findAll();
    res.json(questionTypeSpecifications);
  } catch (err) {
    next(err);
  }
};

export const getQuestionTypeSpecification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionTypeSpecification = await QuestionTypeSpecification.findByPk(req.params.questionTypeSpecificationId);
    res.json(questionTypeSpecification);
  } catch (err) {
    next(err);
  }
};

export const createQuestionTypeSpecification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      value: validatedQuestionTypeSpecification,
      error: validationError,
    }: {
      value: QuestionTypeSpecificationCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const questionTypeSpecification = await QuestionTypeSpecification.findOne({
      where: { slug: validatedQuestionTypeSpecification.slug },
    });
    if (questionTypeSpecification) return next(new DuplicationError('QuestionTypeSpecification'));

    const createdQuestionTypeSpecification = await QuestionTypeSpecification.create(validatedQuestionTypeSpecification);
    res.json(createdQuestionTypeSpecification);
  } catch (err) {
    next(err);
  }
};

export const deleteQuestionTypeSpecification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const questionTypeSpecification = await QuestionTypeSpecification.findByPk(req.params.questionTypeSpecificationId);
    if (!questionTypeSpecification) return next(new NotFoundError('QuestionTypeSpecification'));

    await questionTypeSpecification.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
