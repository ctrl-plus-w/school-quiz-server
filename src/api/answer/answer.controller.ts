import { Request, Response, NextFunction } from 'express';

import { Answer } from '../../models/answer';

import { InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { answerFormatter, answerMapper } from '../../helpers/mapper.helper';
import {
  tryUpdateExactAnswer,
  tryCreateExactAnswer,
  tryUpdateComparisonAnswer,
  tryCreateComparisonAnswer,
  tryCreateComparisonAnswers,
  tryCreateExactAnswers,
} from '../../helpers/answer.helper';
import { Question } from '../../models/question';
import { ExactAnswer } from '../../models/exactAnswer';
import { ComparisonAnswer } from '../../models/comparisonAnswer';

interface AnswerTypes {
  [answerType: string]: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export const getGlobalAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const answers = await Answer.findAll();
    res.json(answerMapper(answers));
  } catch (err) {
    next(err);
  }
};

export const getAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    if (!question.answers) return next(new NotFoundError('Answer'));

    const answerIds = question.answers.map((answer) => answer.id);

    const answers = await Answer.findAll({ where: { id: answerIds } });
    res.json(answerMapper(answers));
  } catch (err) {
    next(err);
  }
};

export const getGlobalAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const answerId = req.params.answerId;
    if (!answerId) return next(new InvalidInputError());

    const answer = await Answer.findByPk(answerId, { include: [ExactAnswer, ComparisonAnswer] });
    if (!answer) return next(new NotFoundError('Answer'));

    res.json(answerFormatter(answer));
  } catch (err) {
    next(err);
  }
};

export const getAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const answerId = req.params.answerId;
    if (!answerId) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    // Fetch the answer from the getAnswers() property.
    if (!question?.answers?.some((answer) => answer.id === parseInt(answerId))) return next(new NotFoundError('Answer'));

    const answer = await Answer.findByPk(answerId, { include: [ExactAnswer, ComparisonAnswer] });
    if (!answer) return next(new NotFoundError('Answer'));

    res.json(answerFormatter(answer));
  } catch (err) {
    next(err);
  }
};

export const postAnswerSpreader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const answerTypes: AnswerTypes = Array.isArray(req.body)
    ? { exact: tryCreateExactAnswers, comparison: tryCreateComparisonAnswers }
    : { exact: tryCreateExactAnswer, comparison: tryCreateComparisonAnswer };

  const answerType = req.params.answerType.toLowerCase();
  if (!Object.keys(answerTypes).includes(answerType)) return next(new InvalidInputError());

  await answerTypes[answerType](req, res, next);
};

export const updateAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const answerId = req.params.answerId;
    if (!answerId) return next(new InvalidInputError());

    const question: Question | undefined = res.locals.question;
    if (!question) return next(new NotFoundError('Question'));

    const [answer] = await question.getAnswers({ where: { id: answerId } });
    if (!answer) return next(new NotFoundError('Answer'));

    if (answer.answerType === 'exactAnswer') return tryUpdateExactAnswer(req, res, next, answer);
    if (answer.answerType === 'comparisonAnswer') return tryUpdateComparisonAnswer(req, res, next, answer);

    next();
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
