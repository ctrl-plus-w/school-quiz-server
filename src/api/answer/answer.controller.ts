import { Request, Response, NextFunction } from 'express';

import { Answer } from '../../models/answer';

import { InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { answerFormatter, answerMapper } from '../../helpers/mapper.helper';
import { tryCreateExactAnswer, tryCreateComparisonAnswer } from '../../helpers/answer.helper';

interface AnswerTypes {
  [answerType: string]: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export const getAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const answers = await Answer.findAll();
    res.json(answerMapper(answers));
  } catch (err) {
    next(err);
  }
};

export const getAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const answerId = req.params.answerId;
    if (!answerId) return next(new InvalidInputError());

    const answer = await Answer.findByPk(answerId);
    res.json(answerFormatter(answer));
  } catch (err) {
    next(err);
  }
};

export const createAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const answerTypes: AnswerTypes = {
      exact: tryCreateExactAnswer,
      comparison: tryCreateComparisonAnswer,
    };

    const answerType = req.params.answerType.toLowerCase();
    if (!Object.keys(answerTypes).includes(answerType)) return next(new InvalidInputError());

    await answerTypes[answerType](req, res, next);
  } catch (err) {
    next(err);
  }
};

export const deleteAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const answerId = req.params.answerId;
    if (!answerId) return next(new InvalidInputError());

    const answer = await Answer.findByPk(answerId);
    if (!answer) return next(new NotFoundError('Answer'));

    if (answer.typedAnswer) await answer.typedAnswer.destroy();

    await answer.destroy();

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
};
