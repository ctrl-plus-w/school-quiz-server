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
import { Choice } from '../../models/choice';
import { Answer } from '../../models/answer';
import { Quiz } from '../../models/quiz';
import { User } from '../../models/user';

import StatusError, { InvalidInputError, NotFoundError } from '../../classes/StatusError';

import { questionFormatter, questionMapper } from '../../helpers/mapper.helper';

import {
  tryCreateChoiceQuestion,
  tryCreateNumericQuestion,
  tryCreateTextualQuestion,
  tryUpdateChoiceQuestion,
  tryUpdateNumericQuestion,
  tryUpdateTextualQuestion,
} from '../../helpers/question.helper';

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
    include: [QuestionSpecification, Choice],
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

    const [question] = await quiz.getQuestions({ where: { id: questionId }, include: questionIncludes });
    if (!question) return next(new NotFoundError('Question'));

    res.json(questionFormatter(question));
  } catch (err) {
    next(err);
  }
};

export const getQuestionVerificationType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) return next(new InvalidInputError());

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const [question] = await quiz.getQuestions({ where: { id: questionId } });
    if (!question) return next(new NotFoundError('Question'));

    const textualQuestion = await question.getTextualQuestion();
    if (!textualQuestion) return next(new NotFoundError('Question'));

    const verificationType = await textualQuestion.getVerificationType();
    if (!verificationType) return next(new NotFoundError('Verification type'));

    res.json(verificationType);
  } catch (err) {
    next(err);
  }
};

export const getQuestionSpecification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) return next(new InvalidInputError());

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const [question] = await quiz.getQuestions({ where: { id: questionId }, include: [TextualQuestion, NumericQuestion, ChoiceQuestion] });
    if (!question || !question.typedQuestion) return next(new NotFoundError('Question'));

    const specification = await question.typedQuestion.getQuestionSpecification();
    if (!specification) return next(new NotFoundError('Question specification'));

    res.json(specification);
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void | boolean> => {
  try {
    const questionTypes: QuestionTypes = {
      textualQuestion: tryCreateTextualQuestion,
      numericQuestion: tryCreateNumericQuestion,
      choiceQuestion: tryCreateChoiceQuestion,
    };

    const questionType = req.params.questionType;
    if (!questionType || !Object.keys(questionTypes).includes(questionType)) return next(new InvalidInputError());

    await questionTypes[questionType](req, res, next);
  } catch (err) {
    next(err);
  }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void | boolean> => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) return next(new InvalidInputError());

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const [question] = await quiz.getQuestions({ where: { id: questionId } });
    if (!question) return next(new NotFoundError('Question'));

    if (question.questionType === 'textualQuestion') return tryUpdateTextualQuestion(req, res, next, question);
    if (question.questionType === 'numericQuestion') return tryUpdateNumericQuestion(req, res, next, question);
    if (question.questionType === 'choiceQuestion') return tryUpdateChoiceQuestion(req, res, next, question);

    next();
  } catch (err) {
    next(err);
  }
};

export const setVerificationType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = req.params.questionId;
    const verificationTypeId = req.body.verificationTypeId;
    const verificationTypeSlug = req.body.verificationTypeSlug;
    if (!questionId) return next(new InvalidInputError());

    if (!verificationTypeId && !verificationTypeSlug) return next(new InvalidInputError());

    const verificationType = verificationTypeId
      ? await VerificationType.findByPk(verificationTypeId)
      : await VerificationType.findOne({ where: { slug: verificationTypeSlug } });

    if (!verificationType) return next(new NotFoundError('Verification type'));

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const [question] = await quiz.getQuestions({ where: { id: questionId } });
    if (!question) return next(new NotFoundError('Question'));

    const textualQuestion = await question.getTextualQuestion();
    if (!textualQuestion) return next(new NotFoundError('Question'));

    await textualQuestion.setVerificationType(verificationType);

    res.json({ set: true });
  } catch (err) {
    next(err);
  }
};

export const setSpecification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = req.params.questionId;
    const specificationId = req.body.questionSpecificationId;
    if (!questionId || !specificationId) return next(new InvalidInputError());

    const specification = await QuestionSpecification.findByPk(specificationId);
    if (!specification) return next(new NotFoundError('Question specification'));

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const [question] = await quiz.getQuestions({ where: { id: questionId }, include: [TextualQuestion, NumericQuestion, ChoiceQuestion] });
    if (!question || !question.typedQuestion) return next(new NotFoundError('Question'));

    if (question.questionType !== specification.questionType)
      return next(new StatusError("The question specification type doesn't match the question type", 400));

    await question.typedQuestion.setQuestionSpecification(specification);

    res.json({ set: true });
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
