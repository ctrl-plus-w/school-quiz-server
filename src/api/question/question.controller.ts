import { Request, Response, NextFunction } from 'express';

import { Question } from '../../models/question';

import { DuplicationError, InvalidInputError } from '../../classes/StatusError';

import { questionFormatter, questionMapper } from '../../helpers/mapper.helper';

import {
  tryCreateChoiceQuestion,
  tryCreateNumericQuestion,
  tryCreateTextualQuestion,
} from '../../helpers/question.helper';

interface QuestionTypes {
  [questionType: string]: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export const getQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questions = await Question.findAll();
    res.json(questionMapper(questions));
  } catch (err) {
    next(err);
  }
};

export const getQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) return next(new InvalidInputError());

    const question = await Question.findByPk(questionId);
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

    next(new InvalidInputError());
  } catch (err) {
    next(err);
  }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) return next(new InvalidInputError());

    const question = await Question.findByPk(questionId);
    if (!question) return next(new DuplicationError('Question'));

    await question.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
