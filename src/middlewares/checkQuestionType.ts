import { Request, Response, NextFunction } from 'express';

import { Question } from '../models/question';

import StatusError, { NotFoundError } from '../classes/StatusError';

type QuestionTypes = 'textualQuestion' | 'numericQuestion' | 'choiceQuestion';

export const checkQuestionTypes = (types: Array<QuestionTypes>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question: Question | undefined = res.locals.question;
      if (!question) return next(new NotFoundError('Question'));

      if (!types.some((type) => type === question.questionType))
        return next(new StatusError('Ressource not found on this type of question', 404));

      next();
    } catch (err) {
      next(err);
    }
  };
};

export const checkQuestionHasType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    if (!question.questionType) return next(new StatusError("Question doesn't have a type", 404));

    next();
  } catch (err) {
    next(err);
  }
};

export const checkIsTextualOrNumeric = checkQuestionTypes(['textualQuestion', 'numericQuestion']);

export const checkIsTextual = checkQuestionTypes(['textualQuestion']);

export const checkIsNumeric = checkQuestionTypes(['numericQuestion']);

export const checkIsChoice = checkQuestionTypes(['choiceQuestion']);

export default checkQuestionTypes;
