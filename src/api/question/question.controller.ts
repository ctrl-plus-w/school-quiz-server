import { Request, Response, NextFunction } from 'express';
import { Includeable } from 'sequelize';

import { QuestionSpecification } from '../../models/questionSpecification';
import { ComparisonAnswer } from '../../models/comparisonAnswer';
import { VerificationType } from '../../models/verificationType';
import { NumericQuestion } from '../../models/numericQuestion';
import { TextualQuestion } from '../../models/textualQuestion';
import { ChoiceQuestion } from '../../models/choiceQuestion';
import { ExactAnswer } from '../../models/exactAnswer';
import { UserAnswer } from '../../models/userAnswer';
import { Question } from '../../models/question';
import { Answer } from '../../models/answer';
import { Quiz } from '../../models/quiz';
import { User } from '../../models/user';

import { InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { questionFormatter, questionMapper } from '../../helpers/mapper.helper';

import { tryCreateChoiceQuestion, tryCreateNumericQuestion, tryCreateTextualQuestion } from '../../helpers/question.helper';

interface QuestionTypes {
  [questionType: string]: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

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
    include: [QuestionSpecification],
  },
  {
    model: Answer,
    include: [ExactAnswer, ComparisonAnswer],
  },
  {
    model: UserAnswer,
    include: [{ model: User, attributes: ['id', 'username'] }],
  },
];

export const getGlobalQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questions = await Question.findAll();
    res.json(questionMapper(questions));
  } catch (err) {
    next(err);
  }
};

export const getQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quiz = <Quiz>res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const questions = await quiz.getQuestions();
    res.json(questionMapper(questions));
  } catch (err) {
    next(err);
  }
};

export const getGlobalQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) return next(new InvalidInputError());

    const question = await Question.findByPk(questionId, {
      include: [{ model: Quiz, where: { id: res.locals.quiz.id } }, ...questionIncludes],
    });

    if (!question) return next(new NotFoundError('Question'));

    res.json(questionFormatter(question));
  } catch (err) {
    next(err);
  }
};

export const getQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) return next(new InvalidInputError());

    const quiz = <Quiz>res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const question = await quiz.getQuestions({ where: { id: questionId }, include: questionIncludes });
    if (question.length === 0) return next(new NotFoundError('Question'));

    res.json(questionFormatter(question[0]));
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void | boolean> => {
  try {
    const questionTypes: QuestionTypes = {
      textual: tryCreateTextualQuestion,
      numeric: tryCreateNumericQuestion,
      choice: tryCreateChoiceQuestion,
    };

    const questionType = req.params.questionType;
    if (!questionType || !Object.keys(questionTypes).includes(questionType?.toLowerCase())) return next(new InvalidInputError());

    await questionTypes[questionType](req, res, next);
  } catch (err) {
    next(err);
  }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) return next(new InvalidInputError());

    const question = await Question.findByPk(questionId, {
      include: {
        model: Quiz,
        where: { id: res.locals.quiz.id },
      },
    });
    if (!question) return next(new NotFoundError('Question'));

    await question.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
