import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { Question } from '../../models/question';
import { QuestionSpecification } from '../../models/questionSpecification';
import { ChoiceQuestion } from '../../models/choiceQuestion';
import { Choice, ChoiceCreationAttributes } from '../../models/choice';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { slugify } from '../../utils/string.utils';

import { AllOptional } from '../../types/optional.types';

const arrayCreationSchema = Joi.array()
  .items(
    Joi.object({
      valid: Joi.boolean().required(),
      name: Joi.string().min(1).max(35).required(),
    })
  )
  .min(1);

const creationSchema = Joi.object({
  valid: Joi.boolean().required(),
  name: Joi.string().min(1).max(35).required(),
  slug: Joi.string().min(1).max(35).required(),
});

const updateSchema = Joi.object({
  valid: Joi.boolean(),
  name: Joi.string().min(1).max(35),
}).min(1);

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

    if (!question.typedQuestion) return next(new NotFoundError('Choice question'));

    const choiceQuestion = await ChoiceQuestion.findByPk(question.typedQuestion.id, {
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

    if (!question.typedQuestion) return next(new NotFoundError('Choice question'));

    const choiceQuestion = await ChoiceQuestion.findByPk(question.typedQuestion.id, {
      include: { model: Choice, attributes: ['id'] },
      attributes: ['id'],
    });

    if (!choiceQuestion) return next(new NotFoundError('Choice question'));

    if (!choiceQuestion?.choices?.some((choice) => choice.id === parseInt(choiceId))) return next(new NotFoundError('Choice'));

    const choice = await Choice.findByPk(choiceId);
    if (!choice) return next(new NotFoundError('Choice'));

    res.json(choice);
  } catch (err) {
    next(err);
  }
};

export const postChoiceSpreader = (req: Request, res: Response, next: NextFunction): void => {
  if (Array.isArray(req.body)) createChoices(req, res, next);
  else createChoice(req, res, next);
};

export const createChoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedChoice,
      error: validationError,
    }: {
      value: ChoiceCreationAttributes;
      error?: Error;
    } = creationSchema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    if (!question.typedQuestion) return next(new NotFoundError('Choice question'));

    const choiceQuestion = await ChoiceQuestion.findByPk(question.typedQuestion.id, { attributes: ['id'] });
    if (!choiceQuestion) return next(new NotFoundError('Choice question'));

    const questionSpecification = await choiceQuestion.getQuestionSpecification();
    if (!questionSpecification) return next(new NotFoundError('Question specification'));

    const conditions =
      questionSpecification.slug === 'choix-unique' && validatedChoice.valid
        ? { slug: validatedChoice.slug, valid: true }
        : { slug: validatedChoice.slug };

    const choices = await choiceQuestion.countChoices({ where: conditions });
    if (choices > 0) return next(new DuplicationError('Choice'));

    const createdChoice = await choiceQuestion.createChoice(validatedChoice);
    res.json(createdChoice);
  } catch (err) {
    next(err);
  }
};

export const createChoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: _validatedChoices,
      error: validationError,
    }: {
      value: Array<ChoiceCreationAttributes>;
      error?: Error;
    } = arrayCreationSchema.validate(req.body);

    const validatedChoices = _validatedChoices.map(({ name, ...rest }) => ({ ...rest, name, slug: slugify(name) }));

    if (validationError) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    if (!question.typedQuestion) return next(new NotFoundError('Choice question'));

    const choiceQuestion = await ChoiceQuestion.findByPk(question.typedQuestion.id, { include: QuestionSpecification });
    if (!choiceQuestion) return next(new NotFoundError('Choice question'));

    const questionSpecification = choiceQuestion.questionSpecification;
    if (!questionSpecification) return next(new NotFoundError('Question specification'));

    // If the question specifcation is 'choix-unique' so only one choice can be valid and the number of valid choices
    // with a valid property to true is over 1, we can't create because only one valid choice is allowed.
    if (questionSpecification.slug === 'choix-unique' && validatedChoices.filter(({ valid }) => valid === true).length > 1)
      return next(new DuplicationError('Choice'));

    const choicesSlug = validatedChoices.map(({ slug }) => slug) as Array<string>;

    const conditions =
      questionSpecification.slug === 'choix-unique' && validatedChoices.some(({ valid }) => valid === true)
        ? { slug: choicesSlug, valid: true }
        : { slug: choicesSlug };

    const choices = await choiceQuestion.countChoices({ where: conditions });
    if (choices > 0) return next(new DuplicationError('Choice'));

    const createdChoices: Array<Choice> = [];

    for (const validatedChoice of validatedChoices) {
      const createdChoice = await choiceQuestion.createChoice(validatedChoice);
      createdChoices.push(createdChoice);
    }

    res.json(createdChoices);
  } catch (err) {
    next(err);
  }
};

export const updateChoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const choiceId = req.params.choiceId;
    if (!choiceId) return next(new InvalidInputError());

    const {
      value: validatedChoice,
      error: validationError,
    }: {
      value: AllOptional<ChoiceCreationAttributes>;
      error?: Error;
    } = updateSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    if (!question.typedQuestion) return next(new NotFoundError('Choice question'));

    const choiceQuestion = await ChoiceQuestion.findByPk(question.typedQuestion.id, { attributes: ['id'] });
    if (!choiceQuestion) return next(new NotFoundError('Choice question'));

    const [choice] = await choiceQuestion.getChoices({ where: { id: choiceId } });
    if (!choice) return next(new NotFoundError('Choice'));

    if (validatedChoice.name) {
      const slug = slugify(validatedChoice.name);

      const choices = await choiceQuestion.countChoices({ where: { slug } });
      if (choices > 0) return next(new DuplicationError('Choice'));

      await choice.update({ ...validatedChoice, slug });
    } else {
      await choice.update(validatedChoice);
    }

    res.json({ updated: true });
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
