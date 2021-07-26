import { Request, Response, NextFunction } from 'express';

import { Question } from '../models/question';

import StatusError, { NotFoundError, UnknownError } from '../classes/StatusError';

import { QuestionTypes } from '../types/question.types';
import { MiddlewareValidationPayload } from '../types/middlewares.types';

export const checkQuestionTypes = (types: Array<QuestionTypes>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
    try {
      const question: Question | undefined = res.locals.question;
      if (!question) return [false, new NotFoundError('Question')];

      if (!types.some((type) => type === question.questionType)) return [false, new StatusError('Ressource not found on this type of question', 404)];

      return [true, null];
    } catch (err) {
      return err instanceof Error ? [false, err] : [false, new UnknownError()];
    }
  };
};

export const checkQuestionHasType = async (req: Request, res: Response, next: NextFunction): Promise<MiddlewareValidationPayload> => {
  try {
    const question: Question | undefined = res.locals.question;
    if (!question) return [false, new NotFoundError('Question')];

    if (!question.questionType) return [false, new StatusError("Question doesn't have a type", 404)];

    return [true, null];
  } catch (err) {
    return err instanceof Error ? [false, err] : [false, new UnknownError()];
  }
};

export const checkIsTextualOrNumeric = checkQuestionTypes(['textualQuestion', 'numericQuestion']);

export const checkIsTextual = checkQuestionTypes(['textualQuestion']);

export const checkIsNumeric = checkQuestionTypes(['numericQuestion']);

export const checkIsChoice = checkQuestionTypes(['choiceQuestion']);

export default checkQuestionTypes;
