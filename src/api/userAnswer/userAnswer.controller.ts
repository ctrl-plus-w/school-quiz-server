import { Request, Response, NextFunction } from 'express';

import Joi from 'joi';

import { ComparisonAnswer } from '../../models/comparisonAnswer';
import { TextualQuestion } from '../../models/textualQuestion';
import { NumericQuestion } from '../../models/numericQuestion';
import { ChoiceQuestion } from '../../models/choiceQuestion';
import { ExactAnswer } from '../../models/exactAnswer';
import { UserAnswer } from '../../models/userAnswer';
import { EventWarn } from '../../models/eventWarn';
import { Question } from '../../models/question';
import { Event } from '../../models/event';
import { User } from '../../models/user';
import { Quiz } from '../../models/quiz';

import { AcccessForbiddenError, DuplicationError, InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { userAnswerFormatter, userAnswerMapper } from '../../helpers/mapper.helper';
import { getQuizQuestionToAnswer } from '../../helpers/question.helper';

import { isNotNull, removeAccents } from '../../utils/mapper.utils';
import { isSameDate } from '../../utils/date.utils';

const schema = Joi.object({
  answer: Joi.string().min(1).max(750),
  answers: Joi.array().items(Joi.string().min(1).max(750)).min(1),
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

    // Check if the user is blocked
    const warn = await EventWarn.findOne({ where: { eventId: event.id, userId: userId }, attributes: ['amount'] });
    if (warn && quiz.strict && warn.amount >= 3) return next(new AcccessForbiddenError());

    // Check if an answer doesn't already exists for this question
    const userAnswer = await UserAnswer.findOne({
      include: [
        { model: User, where: { id: user.id } },
        { model: Question, where: { id: question.id } },
      ],
    });

    if (userAnswer) return next(new DuplicationError('User answer'));

    const choiceQuestion = question.typedQuestion as ChoiceQuestion | null;
    const numericQuestion = question.typedQuestion as NumericQuestion | null;
    const textualQuestion = question.typedQuestion as TextualQuestion | null;

    const answers = ['textualQuestion', 'numericQuestion'].includes(question.questionType)
      ? await question.getAnswers({ include: [{ model: ExactAnswer }, { model: ComparisonAnswer }] })
      : [];

    const choices = question.questionType === 'choiceQuestion' && choiceQuestion ? await choiceQuestion.getChoices() : [];
    const specification = question.questionType === 'numericQuestion' && numericQuestion ? await numericQuestion.getQuestionSpecification() : null;

    // Check if the user answer is valid depending on the question answers or choices
    const checkIsValid = async (userAnswer: string): Promise<boolean | null> => {
      // Check the choice question
      if (question.questionType === 'choiceQuestion') {
        if (choices.length === 0) return null;

        return choices
          .filter((choice) => choice.valid)
          .map((choice) => choice.name)
          .includes(userAnswer);
      }

      // Check the textual question
      if (question.questionType === 'textualQuestion') {
        if (answers.length === 0) return null;

        let answersContent = answers.map((answer) => (<ExactAnswer | null>answer.typedAnswer)?.answerContent).filter(isNotNull);

        // If the textual question isn't accent sensitive, we put everything to lowercase
        if (textualQuestion && !textualQuestion.caseSensitive) {
          answersContent = answersContent.map((answer) => answer.toLowerCase());
          userAnswer = userAnswer.toLowerCase();
        }

        // If the textual question isn't accent sensitive, we remove all accents
        if (textualQuestion && !textualQuestion.accentSensitive) {
          answersContent = answersContent.map(removeAccents);
          userAnswer = removeAccents(userAnswer);
        }

        return answersContent.includes(userAnswer);
      }

      if (question.questionType === 'numericQuestion') {
        if (answers.length === 0) return null;
        if (!numericQuestion) return null;

        const exactAnswers = answers
          .filter((answer) => answer.answerType === 'exactAnswer')
          .map((answer) => <ExactAnswer | null>answer.typedAnswer)
          .filter(isNotNull);

        const comparisonAnswers = answers
          .filter((answer) => answer.answerType === 'comparisonAnswer')
          .map((answer) => <ComparisonAnswer | null>answer.typedAnswer)
          .filter(isNotNull);

        const getParser = (): ((str: string) => number | Date) => {
          if (specification && ['nombre-decimal', 'prix'].includes(specification.slug)) return parseFloat;
          if (specification && ['date'].includes(specification.slug)) return (str: string) => new Date(str);
          return parseInt;
        };

        const parser = getParser();
        const parsedUserAnswer = parser(userAnswer);

        if (!specification || ['nombre-entier', 'pourcentage', 'nombre-decimal', 'prix'].includes(specification.slug)) {
          for (const { greaterThan, lowerThan } of comparisonAnswers) {
            if (parsedUserAnswer > greaterThan && parsedUserAnswer < lowerThan) return true;
          }

          if (exactAnswers.map((answer) => parser(answer.answerContent)).includes(parsedUserAnswer)) return true;
        } else if (['date'].includes(specification.slug)) {
          if (exactAnswers.map((answer) => parser(answer.answerContent) as Date).some(isSameDate(parsedUserAnswer as Date))) return true;
        }
      }

      return false;
    };

    if (validatedUserAnswer.answer) {
      const isValid = await checkIsValid(validatedUserAnswer.answer);

      const createdUserAnswer = await user.createUserAnswer({ answerContent: validatedUserAnswer.answer, valid: isValid });
      await createdUserAnswer.setQuestion(question);

      res.json(userAnswerFormatter(createdUserAnswer));
    } else {
      let createdUserAnswers: Array<UserAnswer> = [];

      for (const userAnswer of validatedUserAnswer.answers) {
        const isValid = await checkIsValid(userAnswer);

        const createdUserAnswer = await user.createUserAnswer({ answerContent: userAnswer, valid: isValid });
        await createdUserAnswer.setQuestion(question);

        createdUserAnswers = createdUserAnswers.concat(createdUserAnswer);
      }

      res.json(userAnswerMapper(createdUserAnswers));
    }
  } catch (err) {
    next(err);
  }
};

export const updateUserAnswerValidity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userAnswerId = req.params.userAnswerId;
    const questionId = req.params.questionId;
    if (!userAnswerId || !questionId) return next(new InvalidInputError());

    const {
      value: validatedUserAnswer,
      error: validationError,
    }: {
      value: { valid: boolean };
      error?: Error;
    } = Joi.object({ valid: Joi.boolean().required() }).validate(req.body);

    if (validationError) return next(new InvalidInputError());

    const event: Event = res.locals.event;
    const quiz = await event.getQuiz({ attributes: ['id'] });

    const question = await getQuizQuestionToAnswer(quiz, parseInt(questionId as string), parseInt(userAnswerId as string));
    if (!question) return next(new NotFoundError('Question'));

    const [userAnswer] = question.userAnswers || [];
    if (!userAnswer) return next(new NotFoundError('UserAnswer'));

    await userAnswer.update(validatedUserAnswer);

    res.json(userAnswer);
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
