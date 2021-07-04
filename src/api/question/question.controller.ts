import { Request, Response, NextFunction } from 'express';

import { QuestionSpecification } from '../../models/questionSpecification';
import { VerificationType } from '../../models/verificationType';
import { NumericQuestion } from '../../models/numericQuestion';
import { TextualQuestion } from '../../models/textualQuestion';
import { ChoiceQuestion } from '../../models/choiceQuestion';
import { Question } from '../../models/question';
import { Quiz } from '../../models/quiz';

import { InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { questionFormatter, questionMapper } from '../../helpers/mapper.helper';

import {
  tryCreateChoiceQuestion,
  tryCreateNumericQuestion,
  tryCreateTextualQuestion,
} from '../../helpers/question.helper';
import { Answer } from '../../models/answer';
import { ExactAnswer } from '../../models/exactAnswer';
import { ComparisonAnswer } from '../../models/comparisonAnswer';

interface QuestionTypes {
  [questionType: string]: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

const questionIncludes = [
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
    const questions = await Question.findAll();
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

    res.json(questionFormatter(question));
  } catch (err) {
    next(err);
  }
};

export const getQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) return next(new InvalidInputError());

    const question = await Question.findByPk(questionId, {
      include: [{ model: Quiz, where: { id: res.locals.quiz.id } }, ...questionIncludes],
    });

    res.json(questionFormatter(question));
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
    if (!questionType || !Object.keys(questionTypes).includes(questionType?.toLowerCase()))
      return next(new InvalidInputError());

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
