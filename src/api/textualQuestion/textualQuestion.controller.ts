import { Request, Response, NextFunction } from 'express';

import { TextualQuestion } from '../../models/textualQuestion';

import { InvalidInputError, NotFoundError } from '../../classes/StatusError';

export const getTextualQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const textualQuestions = await TextualQuestion.findAll();
    res.json(textualQuestions);
  } catch (err) {
    next(err);
  }
};

export const getTextualQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const textualQuestionId = req.params.textualQuestionId;
    if (!textualQuestionId) return next(new InvalidInputError());

    const textualQuestion = await TextualQuestion.findByPk(textualQuestionId);
    if (!textualQuestion) return next(new NotFoundError('Question'));

    res.json(textualQuestion);
  } catch (err) {
    next(err);
  }
};
