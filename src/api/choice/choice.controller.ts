import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { Question } from '../../models/question';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';
import { ChoiceQuestion } from '../../models/choiceQuestion';
import { Choice, ChoiceCreationAttributes } from '../../models/choice';
import { slugify } from '../../utils/string.utils';

const schema = Joi.object({
  valid: Joi.boolean().required(),
  name: Joi.string().min(3).max(35),
  slug: Joi.string().min(3).max(35),
});

export const getGlobalChoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const choices = await Choice.findAll();
    res.json(choices);
  } catch (err) {
    next(err);
  }
};

export const getChoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    if (!question.choiceQuestion) return next(new NotFoundError('Choice question'));

    const choiceQuestion = await ChoiceQuestion.findByPk(question.choiceQuestion.id, {
      include: Choice,
      attributes: ['id'],
    });

    if (!choiceQuestion) return next(new NotFoundError('Choice question'));

    res.json(choiceQuestion.choices);
  } catch (err) {
    next(err);
  }
};

export const getGlobalChoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const choiceId = req.params.choiceId;
    if (!choiceId) return next(new InvalidInputError());

    const choice = await Choice.findByPk(choiceId);
    if (!choice) return next(new NotFoundError('Choice'));

    res.json(choice);
  } catch (err) {
    next(err);
  }
};

export const getChoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const choiceId = req.params.choiceId;
    if (!choiceId) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    if (!question.choiceQuestion) return next(new NotFoundError('Choice question'));

    const choiceQuestion = await ChoiceQuestion.findByPk(question.choiceQuestion.id, {
      include: { model: Choice, attributes: ['id'] },
      attributes: ['id'],
    });

    if (!choiceQuestion) return next(new NotFoundError('Choice question'));

    if (!choiceQuestion?.choices?.some((choice) => choice.id === parseInt(choiceId)))
      return next(new NotFoundError('Choice'));

    const choice = await Choice.findByPk(choiceId);
    if (!choice) return next(new NotFoundError('Choice'));

    res.json(choice);
  } catch (err) {
    next(err);
  }
};

export const createChoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedChoice,
      error: validationError,
    }: {
      value: ChoiceCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    if (!question.choiceQuestion) return next(new NotFoundError('Choice question'));

    const choiceQuestion = await ChoiceQuestion.findByPk(question.choiceQuestion.id, {
      include: { model: Choice, attributes: ['id', 'slug'] },
      attributes: ['id'],
    });

    if (!choiceQuestion) return next(new NotFoundError('Choice question'));

    if (choiceQuestion.choices?.some((choice) => choice.slug === validatedChoice.slug))
      return next(new DuplicationError('Choice'));

    const createdChoice = await choiceQuestion.createChoice(validatedChoice);
    res.json(createdChoice);
  } catch (err) {
    next(err);
  }
};

export const deleteChoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const choiceId = req.params.choiceId;
    if (!choiceId) return next(new InvalidInputError());

    const choice = await Choice.findByPk(choiceId);
    if (!choice) return next(new NotFoundError('Choice'));

    await choice.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
