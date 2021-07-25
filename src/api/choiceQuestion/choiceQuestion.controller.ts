import { Request, Response, NextFunction } from 'express';
import { InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { ChoiceQuestion } from '../../models/choiceQuestion';

export const getChoiceQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const choiceQuestions = await ChoiceQuestion.findAll();
    res.json(choiceQuestions);
  } catch (err) {
    next(err);
  }
};

export const getChoiceQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const choiceQuestionId = req.params.choiceQuestionId;
    if (!choiceQuestionId) return next(new InvalidInputError());

    const choiceQuestion = await ChoiceQuestion.findByPk(choiceQuestionId);
    if (!choiceQuestion) return next(new NotFoundError('Question'));

    res.json(choiceQuestion);
  } catch (err) {
    next(err);
  }
};
