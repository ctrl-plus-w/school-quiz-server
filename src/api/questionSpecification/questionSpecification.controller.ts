import { NextFunction, Request, Response } from 'express';

import Joi from 'joi';

import { QuestionSpecification, QuestionSpecificationCreationAttributes } from '../../models/questionSpecification';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { slugify } from '../../utils/string.utils';

import questionTypes from '../../constants/questionTypes';

const schema = Joi.object({
  name: Joi.string().min(4).max(20).required(),
  slug: Joi.string().min(4).max(20).required(),
  questionType: Joi.string().valid(...questionTypes),
});

export const getQuestionSpecifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionType = req.query.questionType;
    const questionSpecifications = await QuestionSpecification.findAll(questionType ? { where: { questionType } } : {});
    res.json(questionSpecifications);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const getQuestionSpecification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionSpecificationId = req.params.questionSpecificationId;
    if (!questionSpecificationId) return next(new InvalidInputError());

    const questionSpecification = await QuestionSpecification.findByPk(questionSpecificationId);
    if (!questionSpecification) return next(new NotFoundError('Specification'));

    res.json(questionSpecification);
  } catch (err) {
    next(err);
  }
};

export const createQuestionSpecification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedQuestionSpecification,
      error: validationError,
    }: {
      value: QuestionSpecificationCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const questionSpecification = await QuestionSpecification.findOne({
      where: { slug: validatedQuestionSpecification.slug },
    });
    if (questionSpecification) return next(new DuplicationError('QuestionSpecification'));

    const createdQuestionSpecification = await QuestionSpecification.create(validatedQuestionSpecification);
    res.json(createdQuestionSpecification);
  } catch (err) {
    next(err);
  }
};

export const updateQuestionSpecification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionSpecificationId = req.params.questionSpecificationId;
    if (!questionSpecificationId) return next(new InvalidInputError());

    const {
      value: validatedQuestionSpecification,
      error: validationError,
    }: {
      value: QuestionSpecificationCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const questionSpecification = await QuestionSpecification.findByPk(questionSpecificationId);
    if (!questionSpecification) return next(new NotFoundError('Question specification'));

    await questionSpecification.update(validatedQuestionSpecification);

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};

export const deleteQuestionSpecification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionSpecificationId = req.params.questionSpecificationId;
    if (!questionSpecificationId) return next(new InvalidInputError());

    const questionSpecification = await QuestionSpecification.findByPk(questionSpecificationId);
    if (!questionSpecification) return next(new NotFoundError('QuestionSpecification'));

    await questionSpecification.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
