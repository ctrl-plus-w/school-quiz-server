import { Request, Response, NextFunction } from 'express';
import { Includeable } from 'sequelize';

import Joi from 'joi';

import { QuestionSpecification } from '../../models/questionSpecification';
import { Event, EventCreationAttributes } from '../../models/event';
import { ComparisonAnswer } from '../../models/comparisonAnswer';
import { VerificationType } from '../../models/verificationType';
import { TextualQuestion } from '../../models/textualQuestion';
import { NumericQuestion } from '../../models/numericQuestion';
import { ChoiceQuestion } from '../../models/choiceQuestion';
import { ExactAnswer } from '../../models/exactAnswer';
import { UserAnswer } from '../../models/userAnswer';
import { EventWarn } from '../../models/eventWarn';
import { Question } from '../../models/question';
import { Choice } from '../../models/choice';
import { Answer } from '../../models/answer';
import { Group } from '../../models/group';
import { User } from '../../models/user';
import { Quiz } from '../../models/quiz';
import { Role } from '../../models/role';

import StatusError, {
  AcccessForbiddenError,
  DuplicationError,
  ForbiddenAccessParameterError,
  InvalidInputError,
  ModelRoleDuplicationError,
  NotFoundError,
} from '../../classes/StatusError';

import { isNotNull } from '../../utils/mapper.utils';

import { eventFormatter, eventMapper, questionFormatter, quizFormatter, userFormatter, userMapper } from '../../helpers/mapper.helper';
import { getAnsweredAndRemainingQuestions, getValidQuestionConditions } from '../../helpers/question.helper';

import { AllOptional } from '../../types/optional.types';

import database from '../../database';

import { redisMGetAsync } from '../../redis';

import ROLES from '../../constants/roles';

const questionIncludes = (isProfessor: boolean, quizId: number): Includeable | Array<Includeable> => {
  const defaultIncludes: Array<Includeable> = [
    {
      model: Quiz,
      where: { id: quizId },
      attributes: [],
    },
    {
      model: TextualQuestion,
      include: [{ model: QuestionSpecification, attributes: ['id', 'slug', 'name'] }, { model: VerificationType }],
    },
    {
      model: NumericQuestion,
      include: [{ model: QuestionSpecification, attributes: ['id', 'slug', 'name'] }],
    },
  ];

  if (isProfessor) {
    return [
      ...defaultIncludes,
      { model: ChoiceQuestion, include: [{ model: QuestionSpecification, attributes: ['id', 'slug', 'name'] }, { model: Choice }] },
      { model: UserAnswer, include: [{ model: User, attributes: ['id', 'username'] }] },
      { model: Answer, include: [{ model: ExactAnswer }, { model: ComparisonAnswer }] },
    ];
  }

  return [
    ...defaultIncludes,
    {
      model: ChoiceQuestion,
      include: [
        { model: QuestionSpecification, attributes: ['id', 'slug', 'name'] },
        { model: Choice, attributes: ['id', 'slug', 'name'] },
      ],
    },
  ];
};

const createSchema = Joi.object({
  start: Joi.date().required() /*.greater(new Date())*/,
  end: Joi.date().greater(Joi.ref('start')).required(),
  countdown: Joi.date().required(),
  groupId: Joi.number().required(),
  quizId: Joi.number().required(),
});

const updateSchema = Joi.object({
  start: Joi.date() /*.greater(new Date())*/,
  end: Joi.date() /*.greater(new Date)*/,
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

    const event = await Event.findByPk(eventId);
    if (!event) return next(new NotFoundError('Event'));

    const owner = await event.getOwner();
    const collaborators = await event.getCollaborators();
    const group = await event.getGroup();
    const quiz = await event.getQuiz();

    res.json(eventFormatter(event, owner, collaborators, group, quiz));
  } catch (err) {
    next(err);
  }
};

export const getNextEvent = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId: number = res.locals.jwt.userId;
    const event: Event = res.locals.event;

    const user = await User.findByPk(userId, { attributes: ['id', 'roleId'] });
    if (!user) return next(new AcccessForbiddenError());

    const role = await user.getRole();
    if (!role) return next(new AcccessForbiddenError());

    const owner = await event.getOwner({ attributes: ['id', 'username', 'firstName', 'lastName'] });
    const collaborators = await event.getCollaborators({ attributes: ['id', 'username', 'firstName', 'lastName'] });
    const quiz = await event.getQuiz({ attributes: ['id', 'slug', 'title', 'description', 'strict', 'shuffle'] });
    const group = await event.getGroup({ attributes: ['id', 'slug', 'name'] });

    const users =
      role.slug === 'professeur'
        ? await group.getUsers({
            include: [{ model: EventWarn, attributes: ['amount'] }],
            attributes: ['id', 'firstName', 'lastName', 'username', 'gender'],
          })
        : [];

    // Get the users state and map them
    const stringifiedUsersState = users.length > 0 ? await redisMGetAsync(...users.map((user) => user.id.toString())) : [];
    const usersState = stringifiedUsersState.map((state) => state && JSON.parse(state));
    const usersWithState = [...users].map((user, index) => ({ ...user.toJSON(), state: usersState[index] }));

    if (event.start.valueOf() > Date.now() && !event.started) {
      res.json({
        ...eventFormatter(event, owner, collaborators, group, quiz),
        users: role.slug === 'professeur' ? usersWithState : undefined,
        inFuture: true,
      });

      return;
    }

    if (role.slug === 'professeur') {
      res.json({
        ...eventFormatter(event, owner, collaborators, group, quiz),
        users: usersWithState,
      });
    } else {
      const { answeredQuestions, remainingQuestions } = await getAnsweredAndRemainingQuestions(quiz.id, userId);

      const warn = await EventWarn.findOne({ where: { eventId: event.id, userId: userId }, attributes: ['amount'] });
      const isBlocked = (warn && warn.amount >= 3) || false;

      res.json({
        ...eventFormatter(event, owner, collaborators, group, quiz),
        answeredQuestions: answeredQuestions.length,
        remainingQuestions: remainingQuestions.length,
        blocked: isBlocked,
        inFuture: false,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const getActualEventQuestion = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId: number = res.locals.jwt.userId;
    const event: Event = res.locals.event;

    const quiz = await event.getQuiz();
    if (!quiz) return next(new NotFoundError('Quiz'));

    const { answeredQuestions, remainingQuestions } = await getAnsweredAndRemainingQuestions(quiz.id, userId);

    const [question] = await quiz.getQuestions({
      order: quiz.shuffle ? database.random() : [['id', 'ASC']],
      where: getValidQuestionConditions(userId),
      include: questionIncludes(res.locals.isProfessor, quiz.id),
    });

    if (!question) return next(new NotFoundError('Question'));

    const warn = await EventWarn.findOne({ where: { eventId: event.id, userId: userId }, attributes: ['amount'] });

    res.json({
      ...questionFormatter(question),
      answeredQuestions: answeredQuestions.length,
      remainingQuestions: remainingQuestions.length,
      blocked: warn && quiz.strict && warn.amount >= 3,
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

export const warnActualEvent = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId: number = res.locals.jwt.userId;
    const event: Event = res.locals.event;

    const eventId = event.id;
    if (!event || !eventId) return next(new NotFoundError('Event'));

    const quiz = await event.getQuiz();
    if (!quiz) return next(new NotFoundError('Quiz'));

    if (!quiz.strict) return next(new StatusError("The strict isn't strict, so you cannot get warned.", 404));

    const warn = await EventWarn.findOne({
      include: [
        { model: User, where: { id: userId }, attributes: [] },
        { model: Event, where: { id: event.id }, attributes: [] },
      ],
      attributes: ['amount'],
    });

    const user = await User.findByPk(userId);
    if (!user) return next(new AcccessForbiddenError());

    // * Trick to update the ManyToMany middle table. (Adding here make sequelize update the table)

    const newWarnAmount = warn ? warn.amount + 1 : 1;

    await event.addWarnedUser(user, { through: { amount: newWarnAmount } });

    res.json({ warns: newWarnAmount, blocked: newWarnAmount >= 3 });
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

    if (validationError) return next(new InvalidInputError());

    const event = await Event.findByPk(eventId);
    if (!event) return next(new NotFoundError('Event'));

    if (validatedEvent.end) {
      if (new Date(validatedEvent.end) <= new Date(validatedEvent.start || event.start)) return next(new InvalidInputError());
    }

    const group = await event.getGroup();
    if (!group) return next(new NotFoundError('Group'));

    // ! The commented code check if the event isn't conflicting with event that exists in the interval.

    // const relatedGroups = await group.getRelatedGroups();
    // const relatedGroupsId = relatedGroups.map((group) => group.id);

    // const start = validatedEvent.start || event.start;
    // const end = validatedEvent.end || event.end;

    // const eventsAmount = await Event.count({
    //   where: { ...getEventDateConditions(start, end), id: { [Op.not]: event.id } },
    //   include: { model: Group, where: { id: relatedGroupsId } },
    // });

    // if (eventsAmount > 0) return next(new DuplicationError('Event'));

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

      if (user.role.permission > ROLES.PROFESSOR.PERMISSION) return next(new ForbiddenAccessParameterError());

      await event.addCollaborator(user);
    } else {
      const users = await User.findAll({ where: { id: userIds }, attributes: ['id'], include: { model: Role } });

      if (users.length !== userIds.length) return next(new NotFoundError('User'));

      const usersRolePermission = users.map(({ role }) => role && role.permission).filter(isNotNull) as Array<number>;
      if (!usersRolePermission.every((permission) => permission >= ROLES.PROFESSOR.PERMISSION)) return next(new ForbiddenAccessParameterError());

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
