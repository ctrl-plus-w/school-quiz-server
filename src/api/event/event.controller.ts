import { Request, Response, NextFunction } from 'express';
import { Includeable, Op } from 'sequelize';

import Joi from 'joi';

import { Event, EventCreationAttributes } from '../../models/event';
import { User } from '../../models/user';
import { Group } from '../../models/group';
import { Quiz } from '../../models/quiz';
import { Role } from '../../models/role';
import { Question } from '../../models/question';
import { UserAnswer } from '../../models/userAnswer';
import { TextualQuestion } from '../../models/textualQuestion';
import { QuestionSpecification } from '../../models/questionSpecification';
import { VerificationType } from '../../models/verificationType';
import { NumericQuestion } from '../../models/numericQuestion';
import { ChoiceQuestion } from '../../models/choiceQuestion';
import { Choice } from '../../models/choice';

import {
  DuplicationError,
  ForbiddenAccessParameterError,
  InvalidInputError,
  ModelRoleDuplicationError,
  NotFoundError,
} from '../../classes/StatusError';

import { isNotNull } from '../../utils/mapper.utils';

import { eventFormatter, eventMapper, questionFormatter, quizFormatter, userFormatter, userMapper } from '../../helpers/mapper.helper';
import { getEventDateConditions } from '../../helpers/event.helper';

import { AllOptional } from '../../types/optional.types';

import database from '../../database';

import roles from '../../constants/roles';

const questionIncludes: Includeable | Array<Includeable> = [
  {
    model: TextualQuestion,
    include: [QuestionSpecification, VerificationType],
  },
  {
    model: NumericQuestion,
    include: [QuestionSpecification],
  },
  {
    model: ChoiceQuestion,
    include: [QuestionSpecification, Choice],
  },
  {
    model: UserAnswer,
    include: [{ model: User, attributes: ['id', 'username'] }],
  },
];

const createSchema = Joi.object({
  start: Joi.date().required() /*.greater(new Date())*/,
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
    const userId = req.query.userId as string | null;

    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) return next(new NotFoundError('User'));

      const userOwnedEvents = await user.getOwnedEvents();
      const userCollaboratedEvents = await user.getCollaboratedEvents();

      res.json(eventMapper([...userOwnedEvents, ...userCollaboratedEvents]));
    } else {
      const events = await Event.findAll();
      res.json(eventMapper(events));
    }
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

export const getActualEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = res.locals.jwt.userId;

    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) return next(new NotFoundError('User'));

    const groups = await user.getGroups();
    if (!groups) return next(new NotFoundError('User groups'));

    if (groups.length === 0) return next(new NotFoundError('Event'));

    const groupsId = groups.map(({ id }) => id);

    const event = await Event.findOne({
      where: { start: { [Op.lte]: new Date() }, end: { [Op.gte]: new Date() } },
      include: { model: Group, where: { id: groupsId }, attributes: ['id'] },
    });
    if (!event) return next(new NotFoundError('Event'));

    const owner = await event.getOwner();
    const collaborators = await event.getCollaborators();
    const quiz = await event.getQuiz();

    res.json(eventFormatter(event, owner, collaborators, undefined, quiz));
  } catch (err) {
    next(err);
  }
};

export const getActualEventQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = res.locals.jwt.userId;

    const user = await User.findByPk(userId, { attributes: ['id'] });
    if (!user) return next(new NotFoundError('User'));

    const groups = await user.getGroups();
    if (!groups) return next(new NotFoundError('User groups'));

    if (groups.length === 0) return next(new NotFoundError('Event'));

    const groupsId = groups.map(({ id }) => id);

    const event = await Event.findOne({
      where: { start: { [Op.lte]: new Date() }, end: { [Op.gte]: new Date() } },
      include: { model: Group, where: { id: groupsId }, attributes: ['id'] },
    });
    if (!event) return next(new NotFoundError('Event'));

    const quiz = await event.getQuiz();
    if (!quiz) return next(new NotFoundError('Quiz'));

    const userAnswers = await UserAnswer.findAll({
      include: { model: User, where: { id: userId }, attributes: ['id'] },
      attributes: ['id'],
    });

    const userAnswersId = userAnswers.map(({ id }) => id);

    const answeredQuestions = await Question.findAll({
      include: { model: UserAnswer, where: { id: userAnswersId } },
      attributes: ['id'],
    });

    const answeredQuestionsId = answeredQuestions.map(({ id }) => id);

    const questionCount = await quiz.countQuestions();

    const [question] = await quiz.getQuestions({
      order: quiz.shuffle ? database.random() : [['id', 'ASC']],
      where: { id: { [Op.notIn]: answeredQuestionsId } },
      include: questionIncludes,
      limit: 1,
    });

    if (!question) return next(new NotFoundError('Question'));

    res.json({
      ...questionFormatter(question),
      answeredQuestions: answeredQuestions.length,
      remainingQuestions: questionCount - answeredQuestions.length,
    });
  } catch (err) {
    next(err);
  }
};

export const getEventOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event: Event | undefined = res.locals.event;
    if (!event) return next(new NotFoundError('Event'));

    const owner = await event.getOwner();
    res.json(userFormatter(owner));
  } catch (err) {
    next(err);
  }
};

export const getEventCollaborators = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event: Event | undefined = res.locals.event;
    if (!event) return next(new NotFoundError('Event'));

    const collaborators = await event.getCollaborators();
    res.json(userMapper(collaborators));
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

    const [collaborator] = await event.getCollaborators({ where: { id: userId } });
    if (!collaborator) return next(new NotFoundError('Collaborator'));

    res.json(userFormatter(collaborator));
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

    // ! The commented code check if the event isn't conflicting with event that exists in the interval.

    // const relatedGroups = await group.getRelatedGroups();
    // const relatedGroupsId = relatedGroups.map((group) => group.id);

    // const eventsAmount = await Event.count({
    //   where: getEventDateConditions(validatedEvent.start, validatedEvent.end),
    //   include: { model: Group, where: { id: relatedGroupsId } },
    // });

    // if (eventsAmount > 0) return next(new DuplicationError('Event'));

    const createdEvent = await Event.create({
      start: validatedEvent.start,
      end: validatedEvent.end,
      countdown: validatedEvent.countdown,
    });

    await createdEvent.setOwner(user);
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

    const eventsAmount = await Event.count({
      where: { ...getEventDateConditions(start, end), id: { [Op.not]: event.id } },
      include: { model: Group, where: { id: relatedGroupsId } },
    });

    if (eventsAmount > 0) return next(new DuplicationError('Event'));

    await event.update(validatedEvent);

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};

export const addCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.body.userId;
    const userIds = req.body.userIds;
    if (!userId && !userIds) return next(new InvalidInputError());

    const event: Event | undefined = res.locals.event;
    if (!event) return next(new NotFoundError('Event'));

    if (userId && event.ownerId === userId) return next(new ModelRoleDuplicationError());
    if (userIds && userIds.includes(event.ownerId)) return next(new ModelRoleDuplicationError());

    const collaboratorsWithSameId = await event.countCollaborators({ where: { id: userId ? userIds : userIds } });
    if (collaboratorsWithSameId) return next(new DuplicationError('Collaborator'));

    if (userId) {
      const user = await User.findByPk(userId, { attributes: ['id'], include: { model: Role } });

      if (!user) return next(new NotFoundError('User'));
      if (!user.role) return next(new NotFoundError('Role'));

      if (user.role.permission > roles.PROFESSOR.PERMISSION) return next(new ForbiddenAccessParameterError());

      await event.addCollaborator(user);
    } else {
      const users = await User.findAll({ where: { id: userIds }, attributes: ['id'], include: { model: Role } });

      if (users.length !== userIds.length) return next(new NotFoundError('User'));

      const usersRolePermission = users.map(({ role }) => role && role.permission).filter(isNotNull) as Array<number>;
      if (!usersRolePermission.every((permission) => permission >= roles.PROFESSOR.PERMISSION)) return next(new ForbiddenAccessParameterError());

      await event.addCollaborators(users);
    }

    res.json({ updated: true });
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
