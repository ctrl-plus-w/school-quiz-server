import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { State, StateCreationAttributes } from '../../models/state';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';
import { slugify } from '../../utils/string.utils';

const schema = Joi.object({
  slug: Joi.string().min(3).max(20),
  name: Joi.string().min(3).max(20),
});

export const getStates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const states = await State.findAll();
    res.json(states);
  } catch (err) {
    next(err);
  }
};

export const getState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stateId = req.params.stateId;
    if (!stateId) return next(new InvalidInputError());

    const state = await State.findByPk(stateId);
    if (!state) return next(new NotFoundError('State'));

    res.json(state);
  } catch (err) {
    next(err);
  }
};

export const createState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedState,
      error: validationError,
    }: {
      value: StateCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const states = await State.count({ where: { slug: validatedState.slug } });
    if (states > 0) return next(new DuplicationError('State'));

    const createdState = await State.create(validatedState);
    res.json(createdState);
  } catch (err) {
    next(err);
  }
};

export const updateState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stateId = req.params.stateId;
    if (!stateId) return next(new InvalidInputError());

    const {
      value: validatedState,
      error: validationError,
    }: {
      value: StateCreationAttributes;
      error?: Error;
    } = schema.validate({ ...req.body, slug: slugify(req.body.name) });

    if (validationError) return next(new InvalidInputError());

    const state = await State.findByPk(stateId);
    if (!state) return next(new NotFoundError('State'));

    const states = await State.count({ where: { slug: validatedState.slug } });
    if (states > 0) return next(new DuplicationError('State'));

    await state.update(validatedState);

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};

export const deleteState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stateId = req.params.stateId;
    if (!stateId) return next(new InvalidInputError());

    const state = await State.findByPk(stateId);
    if (!state) return next(new NotFoundError('State'));

    await state.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
