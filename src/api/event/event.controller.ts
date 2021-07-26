import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';

import Joi from 'joi';

import { Event, EventCreationAttributes } from '../../models/event';
import { User } from '../../models/user';
import { Group } from '../../models/group';
import { Quiz } from '../../models/quiz';
import { Role } from '../../models/role';
import { Question } from '../../models/question';

import {
  DuplicationError,
  ForbiddenAccessParameterError,
  InvalidInputError,
  ModelRoleDuplicationError,
  NotFoundError,
} from '../../classes/StatusError';

import { eventFormatter, eventMapper, quizFormatter } from '../../helpers/mapper.helper';

import roles from '../../constants/roles';
import { AllOptional } from '../../types/optional.types';
import { getEventDateConditions } from '../../helpers/event.helper';

const createSchema = Joi.object({
  start: Joi.date().required().greater(new Date()),
  end: Joi.date().greater(Joi.ref('start')).required(),
  countdown: Joi.date().required(),
  groupId: Joi.number().required(),
  quizId: Joi.number().required(),
});

const updateSchema = Joi.object({
  start: Joi.date().greater(new Date()),
  end: Joi.date().greater(new Date()),
  countdown: Joi.date(),
}).min(1);

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

    const event = await Event.findByPk(eventId, { include: [Quiz, Group] });
    if (!event) return next(new NotFoundError('Event'));

    const owner = await event.getOwner();
    const collaborators = await event.getCollaborators();

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

    const collaborators = await event.getCollaborators({ where: { id: userId } });
    if (collaborators.length === 0) return next(new NotFoundError('Collaborator'));

    res.json(collaborators[0]);
  } catch (err) {
    next(err);
  }
};

export const getEventGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.collaboratorId;
    if (!userId) return next(new InvalidInputError());

    const event: Event | undefined = res.locals.event;
    if (!event) return next(new NotFoundError('Event'));

    const group = await event.getGroup();
    if (!group) return next(new NotFoundError('Group'));

    res.json(group);
  } catch (err) {
    next(err);
  }
};

export const getEventQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.collaboratorId;
    if (!userId) return next(new InvalidInputError());

    const event: Event | undefined = res.locals.event;
    if (!event) return next(new NotFoundError('Event'));

    const quiz = await event.getQuiz({ include: Question });
    if (!quiz) return next(new NotFoundError('Quiz'));

    const owner = await quiz?.getOwner();
    const collaborators = await quiz?.getCollaborators();

    res.json(quizFormatter(quiz, owner, collaborators));
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
    } = createSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const group = await Group.findByPk(req.body.groupId);
    if (!group) return next(new NotFoundError('Group'));

    const quiz = await Quiz.findByPk(req.body.quizId);
    if (!quiz) return next(new NotFoundError('Quiz'));

    const user = await User.findByPk(res.locals.jwt.userId);
    if (!user) return next(new NotFoundError('User'));

    const relatedGroups = await group.getRelatedGroups();
    const relatedGroupsId = relatedGroups.map((group) => group.id);

    const events = await Event.findAll({
      where: getEventDateConditions(validatedEvent.start, validatedEvent.end),
      include: { model: Group, where: { id: relatedGroupsId } },
    });

    if (events.length > 0) return next(new DuplicationError('Event'));

    const createdEvent = await user.createEvent({
      start: validatedEvent.start,
      end: validatedEvent.end,
      countdown: validatedEvent.countdown,
    });

    await createdEvent.setQuiz(quiz);
    await createdEvent.setGroup(group);

    res.json(eventFormatter(createdEvent, user, undefined, group, quiz));
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eventId = req.params.eventId;
    if (!eventId) return next(new InvalidInputError());

    const {
      value: validatedEvent,
      error: validationError,
    }: {
      value: AllOptional<EventCreationAttributes>;
      error?: Error;
    } = updateSchema.validate(req.body);

    const event = await Event.findByPk(eventId);
    if (!event) return next(new NotFoundError('Event'));

    if (validationError) return next(new InvalidInputError());

    const group = await event.getGroup();
    if (!group) return next(new NotFoundError('Group'));

    const relatedGroups = await group.getRelatedGroups();
    const relatedGroupsId = relatedGroups.map((group) => group.id);

    const start = validatedEvent.start || event.start;
    const end = validatedEvent.end || event.end;

    const events = await Event.findAll({
      where: { ...getEventDateConditions(start, end), id: { [Op.not]: event.id } },
      include: { model: Group, where: { id: relatedGroupsId } },
    });

    if (events.length > 0) return next(new DuplicationError('Event'));

    await event.update(validatedEvent);

    res.json({ updated: true });
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

    if (event.ownerId === userId) return next(new ModelRoleDuplicationError());

    const collaboratorsWithSameId = await event.getCollaborators({ where: { id: userId } });
    if (collaboratorsWithSameId.length > 0) return next(new DuplicationError('Collaborator'));

    const user = await User.findByPk(userId, { attributes: ['id'], include: Role });

    if (!user) return next(new NotFoundError('User'));
    if (!user.role) return next(new NotFoundError('Role'));

    if (user.role.permission > roles.PROFESSOR.PERMISSION) return next(new ForbiddenAccessParameterError());

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
