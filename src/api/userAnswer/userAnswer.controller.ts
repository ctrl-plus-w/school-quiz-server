import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { UserAnswer } from '../../models/userAnswer';
import { EventWarn } from '../../models/eventWarn';
import { Question } from '../../models/question';
import { Event } from '../../models/event';
import { User } from '../../models/user';
import { Quiz } from '../../models/quiz';

import { AcccessForbiddenError, DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { userAnswerFormatter, userAnswerMapper } from '../../helpers/mapper.helper';

const schema = Joi.object({
  answer: Joi.string().min(1).max(45),
  answers: Joi.array().items(Joi.string().min(1).max(45)).min(1),
}).xor('answer', 'answers');

export const getGlobalUserAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userAnswers = await UserAnswer.findAll();
    res.json(userAnswerMapper(userAnswers));
  } catch (err) {
    next(err);
  }
};

export const getUserAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    if (!question.userAnswers) return next(new NotFoundError('User answers'));

    const userAnswersIds = question.userAnswers.map((userAnswer) => userAnswer.id);

    const userAnswers = await UserAnswer.findAll({ where: { id: userAnswersIds } });
    res.json(userAnswerMapper(userAnswers));
  } catch (err) {
    next(err);
  }
};

export const getGlobalUserAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userAnswerId = req.params.userAnswerId;
    if (!userAnswerId) return next(new InvalidInputError());

    const userAnswer = await UserAnswer.findByPk(userAnswerId);
    if (!userAnswer) return next(new NotFoundError('User answer'));

    res.json(userAnswerFormatter(userAnswer));
  } catch (err) {
    next(err);
  }
};

export const getUserAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userAnswerId = req.params.userAnswerId;
    if (!userAnswerId) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    if (!question.userAnswers?.some((userAnswer) => userAnswer.id === parseInt(userAnswerId))) return next(new NotFoundError('User answer'));

    const userAnswer = await UserAnswer.findByPk(userAnswerId);
    if (!userAnswer) return next(new NotFoundError('User answer'));

    res.json(userAnswerFormatter(userAnswer));
  } catch (err) {
    next(err);
  }
};

export const createUserAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId: number = res.locals.jwt.userId;
    const question: Question = res.locals.question;
    const event: Event = res.locals.event;
    const quiz: Quiz = res.locals.quiz;

    const {
      value: validatedUserAnswer,
      error: validationError,
    }: {
      value: { answer: string; answers: Array<string> };
      error?: Error;
    } = schema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const user = await User.findByPk(userId);
    if (!user) return next(new NotFoundError('User'));

    const userGroups = await user.getGroups({ attributes: ['id'] });
    if (userGroups.length === 0) return next(new NotFoundError('Event'));

    const userAnswer = await UserAnswer.findOne({
      include: [
        { model: User, where: { id: user.id } },
        { model: Question, where: { id: question.id } },
      ],
    });

    if (userAnswer) return next(new DuplicationError('User answer'));

    const warn = await EventWarn.findOne({ where: { eventId: event.id, userId: userId }, attributes: ['amount'] });
    if (warn && quiz.strict && warn.amount >= 3) return next(new AcccessForbiddenError());

    if (validatedUserAnswer.answer) {
      const createdUserAnswer = await user.createUserAnswer({ answerContent: validatedUserAnswer.answer });
      await createdUserAnswer.setQuestion(question);

      res.json(userAnswerFormatter(createdUserAnswer));
    } else {
      let createdUserAnswers: Array<UserAnswer> = [];

      for (const userAnswer of validatedUserAnswer.answers) {
        const createdUserAnswer = await user.createUserAnswer({ answerContent: userAnswer });
        await createdUserAnswer.setQuestion(question);

        createdUserAnswers = createdUserAnswers.concat(createdUserAnswer);
      }

      res.json(userAnswerMapper(createdUserAnswers));
    }
  } catch (err) {
    next(err);
  }
};

export const deleteUserAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userAnswerId = req.params.userAnswerId;
    if (!userAnswerId) return next(new InvalidInputError());

    const userAnswer = await UserAnswer.findByPk(userAnswerId);
    if (!userAnswer) return next(new NotFoundError('User answer'));

    await userAnswer.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
