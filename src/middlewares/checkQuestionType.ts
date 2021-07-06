import { Request, Response, NextFunction } from 'express';

import { Question } from '../models/question';

import StatusError, { NotFoundError } from '../classes/StatusError';

type QuestionTypes = 'textualQuestion' | 'numericQuestion' | 'choiceQuestion';

const checkQuestionType = (type: QuestionTypes) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question: Question | undefined = res.locals.question;
      if (!question) return next(new NotFoundError('Question'));

      if (question.questionType !== type) return next(new StatusError('Wrong question type', 404));

      next();
    } catch (err) {
      next(err);
    }
  };
};

export const checkIsTextual = checkQuestionType('textualQuestion');

export const checkIsNumeric = checkQuestionType('numericQuestion');

export const checkIsChoice = checkQuestionType('choiceQuestion');

export default checkQuestionType;
