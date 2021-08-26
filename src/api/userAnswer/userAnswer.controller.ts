import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { Question } from '../../models/question';
import { UserAnswer } from '../../models/userAnswer';

import { DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';
import { userAnswerFormatter, userAnswerMapper } from '../../helpers/mapper.helper';
import { User } from '../../models/user';
import { Group } from '../../models/group';
import { Quiz } from '../../models/quiz';
import { Event } from '../../models/event';
import { Op } from 'sequelize';

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
    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const {
      value: validatedUserAnswer,
      error: validationError,
    }: {
      value: { answer: string; answers: Array<string> };
      error?: Error;
    } = schema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const user = await User.findByPk(res.locals.jwt.userId);
    if (!user) return next(new NotFoundError('User'));

    const userGroups = await user.getGroups({ attributes: ['id'] });
    if (userGroups.length === 0) return next(new NotFoundError('Event'));

    const userGroupsId = userGroups.map(({ id }) => id);

    const possibleEventsAmount = await Event.count({
      where: { start: { [Op.lte]: new Date() }, end: { [Op.gte]: new Date() } },
      include: [
        { model: Quiz, where: { id: quiz.id } },
        { model: Group, where: { id: userGroupsId } },
      ],
    });

    if (possibleEventsAmount === 0) return next(new NotFoundError('Event'));

    const userAnswer = await UserAnswer.findOne({
      include: [
        { model: User, where: { id: user.id } },
        { model: Question, where: { id: question.id } },
      ],
    });

    if (userAnswer) return next(new DuplicationError('User answer'));

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
