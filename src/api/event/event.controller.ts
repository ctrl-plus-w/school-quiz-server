import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { Event, EventCreationAttributes } from '../../models/event';
import { User } from '../../models/user';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { eventFormatter, eventMapper } from '../../helpers/mapper.helper';
import { Group } from '../../models/group';
import { Quiz } from '../../models/quiz';

const schema = Joi.object({
  start: Joi.date().required(),
  countdown: Joi.date().required(),
  groupId: Joi.number().required(),
  quizId: Joi.number().required(),
});

export const getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const events = await Event.findAll();
    res.json(eventMapper(events));
  } catch (err) {
    next(err);
  }
};

export const getEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.eventId;
    if (!eventId) return next(new InvalidInputError());

    const event = await Event.findByPk(eventId, { include: [Quiz] });

    const owner = await event?.getOwner();
    const collaborators = await event?.getCollaborators();

    res.json(eventFormatter(event, owner, collaborators));
  } catch (err) {
    next(err);
  }
};

export const getEventOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event: Event | undefined = res.locals.event;
    if (!event) return next(new NotFoundError('Event'));

    const owner = await event.getOwner();
    res.json(owner);
  } catch (err) {
    next(err);
  }
};

export const getEventCollaborators = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event: Event | undefined = res.locals.event;
    if (!event) return next(new NotFoundError('Event'));

    const collaborators = await event.getCollaborators();
    res.json(collaborators);
  } catch (err) {
    next(err);
  }
};

export const getEventCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.collaboratorId;
    if (!userId) return next(new InvalidInputError());

    const event: Event | undefined = res.locals.event;
    if (!event) return next(new NotFoundError('Event'));

    const collaborators = await event.getCollaborators();
    res.json(collaborators.find((user) => user.id === parseInt(userId)));
  } catch (err) {
    next(err);
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedEvent,
      error: validationError,
    }: {
      value: EventCreationAttributes;
      error?: Error;
    } = schema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const group = await Group.findByPk(req.body.groupId);
    if (!group) return next(new NotFoundError('Group'));

    const quiz = await Quiz.findByPk(req.body.quizId);
    if (!quiz) return next(new NotFoundError('Quiz'));

    const user = await User.findByPk(res.locals.jwt.userId);
    if (!user) return next(new NotFoundError('User'));

    const events = await user.getEvents({ where: { start: validatedEvent.start } });
    if (events.length > 0) return next(new DuplicationError('Event'));

    const createdEvent = await user.createEvent({ start: validatedEvent.start, countdown: validatedEvent.countdown });

    await createdEvent.setQuiz(quiz);
    await createdEvent.setGroup(group);

    res.json(eventFormatter(createdEvent, user, undefined, group, quiz));
  } catch (err) {
    next(err);
  }
};

export const addCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.body.userId;
    if (!userId) return next(new InvalidInputError());

    const event: Event | undefined = res.locals.event;
    if (!event) return next(new NotFoundError('Event'));

    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) return next(new NotFoundError('User'));

    await event.addCollaborator(user);

    res.json({ added: true });
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.eventId;
    if (!eventId) return next(new InvalidInputError());

    const event = await Event.findByPk(eventId);
    if (!event) return next(new NotFoundError('Event'));

    await event.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};

export const removeCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.collaboratorId;
    if (!userId) return next(new InvalidInputError());

    const event: Event | undefined = res.locals.event;
    if (!event) return next(new NotFoundError('Event'));

    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) return next(new NotFoundError('User'));

    const eventCollaborators = await event.getCollaborators({ attributes: ['id'] });

    if (!eventCollaborators || !eventCollaborators.some((collaborator) => collaborator.id === parseInt(userId)))
      return next(new NotFoundError('Collaborators'));

    await event.removeCollaborator(user);

    res.json({ removed: true });
  } catch (err) {
    next(err);
  }
};
