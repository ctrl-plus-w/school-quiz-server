import { Request, Response, NextFunction } from 'express';
import { Sequelize, WhereOptions, Op } from 'sequelize';

import sequelize from 'sequelize';
import Joi from 'joi';

import { Question, TypedQuestion } from '../models/question';
import { Quiz } from '../models/quiz';

import { NumericQuestion, NumericQuestionCreationAttributes } from '../models/numericQuestion';
import { TextualQuestion, TextualQuestionCreationAttributes } from '../models/textualQuestion';
import { ChoiceQuestion, ChoiceQuestionCreationAttributes } from '../models/choiceQuestion';
import { QuestionSpecification } from '../models/questionSpecification';
import { VerificationType } from '../models/verificationType';
import { UserAnswer } from '../models/userAnswer';

import StatusError, { DuplicationError, InvalidInputError, NotFoundError } from '../classes/StatusError';

import { questionFormatter } from './mapper.helper';

import { oneLine, slugify } from '../utils/string.utils';

import { AllOptional } from '../types/optional.types';

/* Global schemas */
const questionCreationSchema: Joi.SchemaMap = {
  title: Joi.string().min(1).max(35).required(),
  slug: Joi.string().min(1).max(35).required(),
  description: Joi.string().min(1).max(120).required(),
};

const questionUpdateSchema: Joi.SchemaMap = {
  title: Joi.string().min(1).max(35),
  description: Joi.string().min(1).max(120),
};

/* Textual question schemas */
const textualQuestionCreationSchema = Joi.object({
  ...questionCreationSchema,

  accentSensitive: Joi.boolean().required(),
  caseSensitive: Joi.boolean().required(),

  verificationTypeId: Joi.number(),
  verificationTypeSlug: Joi.string().valid('automatique', 'hybride', 'manuel'),
}).xor('verificationTypeId', 'verificationTypeSlug');

const textualQuestionUpdateSchema = Joi.object({
  ...questionUpdateSchema,

  accentSensitive: Joi.boolean(),
  caseSensitive: Joi.boolean(),

  verificationTypeId: Joi.number(),
  verificationTypeSlug: Joi.string().valid('automatique', 'hybride', 'manuel'),
})
  .min(1)
  .oxor('verificationTypeId', 'verificationTypeSlug');

/* Numeric question schemas */
const numericQuestionSchema = Joi.object({
  ...questionCreationSchema,

  questionSpecificationId: Joi.number(),
  questionSpecificationSlug: Joi.string(),
}).xor('questionSpecificationId', 'questionSpecificationSlug');

const numericQuestionUpdateSchema = Joi.object({
  ...questionUpdateSchema,

  questionSpecificationId: Joi.number(),
  questionSpecificationSlug: Joi.string(),
}).oxor('questionSpecificationId', 'questionSpecificationSlug');

/* Choice question schemas */
const choiceQuestionCreationSchema = Joi.object({
  ...questionCreationSchema,

  shuffle: Joi.boolean().required(),
  questionSpecificationId: Joi.number(),
  questionSpecificationSlug: Joi.string(),
}).xor('questionSpecificationId', 'questionSpecificationSlug');

const choiceQuestionUpdateSchema = Joi.object({
  ...questionUpdateSchema,

  shuffle: Joi.boolean(),
  questionSpecificationId: Joi.number(),
  questionSpecificationSlug: Joi.string(),
}).oxor('questionSpecificationId', 'questionSpecificationSlug');

type TextualQuestionIntersection = Question & TextualQuestionCreationAttributes & { verificationTypeId?: number; verificationTypeSlug?: string };

type NumericQuestionIntersection = Question &
  NumericQuestionCreationAttributes & { questionSpecificationId?: number; questionSpecificationSlug?: number };

type ChoiceQuestionIntersection = Question &
  ChoiceQuestionCreationAttributes & { questionSpecificationId?: number; questionSpecificationSlug?: number };

const createQuestion = async (
  createdTypedQuestion: TypedQuestion,
  validatedSchema: NumericQuestionIntersection | NumericQuestionIntersection | ChoiceQuestionIntersection,
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<Question | undefined> => {
  try {
    const createdQuestion = await createdTypedQuestion.createQuestion({
      title: validatedSchema.title,
      slug: validatedSchema.slug,
      description: validatedSchema.description,
    });

    return createdQuestion;
  } catch (err) {
    next(err);
  }
};

export const tryCreateTextualQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedTextualQuestion,
      error: validationError,
    }: {
      value: TextualQuestionIntersection;
      error?: Error;
    } = textualQuestionCreationSchema.validate({ ...req.body, slug: slugify(req.body.title) });

    if (validationError) return next(new InvalidInputError());

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const questionsWithSameSlug = await quiz.countQuestions({ where: { slug: validatedTextualQuestion.slug } });
    if (questionsWithSameSlug > 0) return next(new DuplicationError('Question'));

    const createdTextualQuestion = TextualQuestion.build({
      accentSensitive: validatedTextualQuestion.accentSensitive,
      caseSensitive: validatedTextualQuestion.caseSensitive,
    });

    const condition = validatedTextualQuestion.verificationTypeId
      ? { id: validatedTextualQuestion.verificationTypeId }
      : { slug: validatedTextualQuestion.verificationTypeSlug };

    const verificationType = await VerificationType.findOne({ where: condition });
    if (!verificationType) return next(new NotFoundError('Verification type'));

    await createdTextualQuestion.save();
    await createdTextualQuestion.setVerificationType(verificationType);

    const createdQuestion = await createQuestion(createdTextualQuestion, validatedTextualQuestion, req, res, next);
    if (!createdQuestion) return next(new Error());

    const fetchedCreatedQuestion = await Question.findByPk(createdQuestion.id);
    if (!fetchedCreatedQuestion) return next(new Error());

    await quiz.addQuestion(fetchedCreatedQuestion);

    res.json(questionFormatter(createdQuestion));
  } catch (err) {
    next(err);
  }
};

export const tryUpdateTextualQuestion = async (req: Request, res: Response, next: NextFunction, question: Question): Promise<void> => {
  try {
    const {
      value: validatedTextualQuestion,
      error: validationError,
    }: {
      value: AllOptional<TextualQuestionIntersection>;
      error?: Error;
    } = textualQuestionUpdateSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    // Update question properties
    if (validatedTextualQuestion.title) {
      question.title = validatedTextualQuestion.title;
      question.slug = slugify(validatedTextualQuestion.title) || question.slug;
    }

    if (validatedTextualQuestion.description) question.description = validatedTextualQuestion.description;

    const textualQuestion = await question.getTextualQuestion();
    if (!textualQuestion) return next(new NotFoundError('Question'));

    // Update textual question properties
    if (validatedTextualQuestion.accentSensitive) textualQuestion.accentSensitive = validatedTextualQuestion.accentSensitive;
    if (validatedTextualQuestion.caseSensitive) textualQuestion.caseSensitive = validatedTextualQuestion.caseSensitive;

    if (validatedTextualQuestion.verificationTypeId || validatedTextualQuestion.verificationTypeSlug) {
      const condition = validatedTextualQuestion.verificationTypeId
        ? { id: validatedTextualQuestion.verificationTypeId }
        : { slug: validatedTextualQuestion.verificationTypeSlug };

      const verificationType = await VerificationType.findOne({ where: condition });
      if (!verificationType) return next(new NotFoundError('Verification type'));

      await textualQuestion.setVerificationType(verificationType);

      await question.save();
      await textualQuestion.save();
    } else {
      await question.save();
      await textualQuestion.save();
    }

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};

export const tryCreateNumericQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedNumericQuestion,
      error: validationError,
    }: {
      value: NumericQuestionIntersection;
      error?: Error;
    } = numericQuestionSchema.validate({ ...req.body, slug: slugify(req.body.title) });

    if (validationError) return next(new InvalidInputError());

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const questionsWithSameSlug = await quiz.countQuestions({ where: { slug: validatedNumericQuestion.slug } });
    if (questionsWithSameSlug > 0) return next(new DuplicationError('Question'));

    const questions = await Question.count({ where: { slug: validatedNumericQuestion.slug } });
    if (questions > 0) return next(new DuplicationError('Question'));

    const createdNumericQuestion = NumericQuestion.build();

    const condition = validatedNumericQuestion.questionSpecificationId
      ? { id: validatedNumericQuestion.questionSpecificationId }
      : { slug: validatedNumericQuestion.questionSpecificationSlug };

    const questionSpecification = await QuestionSpecification.findOne({ where: condition });
    if (!questionSpecification) return next(new NotFoundError('Question specification'));

    if (questionSpecification.questionType !== 'numericQuestion')
      return next(new StatusError("The question specification type doesn't match the question type", 400));

    await createdNumericQuestion.save();
    await createdNumericQuestion.setQuestionSpecification(questionSpecification);

    const createdQuestion = await createQuestion(createdNumericQuestion, validatedNumericQuestion, req, res, next);
    if (!createdQuestion) return next(new Error());

    await quiz.addQuestion(createdQuestion);

    res.json(questionFormatter(createdQuestion));
  } catch (err) {
    next(err);
  }
};

export const tryUpdateNumericQuestion = async (req: Request, res: Response, next: NextFunction, question: Question): Promise<void> => {
  try {
    const {
      value: validatedNumericQuestion,
      error: validationError,
    }: {
      value: AllOptional<NumericQuestionIntersection>;
      error?: Error;
    } = numericQuestionUpdateSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    // Update question properties
    if (validatedNumericQuestion.title) {
      question.title = validatedNumericQuestion.title;
      question.slug = slugify(validatedNumericQuestion.title) || question.slug;
    }

    if (validatedNumericQuestion.description) question.description = validatedNumericQuestion.description;

    const numericQuestion = await question.getNumericQuestion();
    if (!numericQuestion) return next(new NotFoundError('Numeric question'));

    // Update numeric question properties
    if (validatedNumericQuestion.questionSpecificationId || validatedNumericQuestion.questionSpecificationSlug) {
      const condition = validatedNumericQuestion.questionSpecificationId
        ? { id: validatedNumericQuestion.questionSpecificationId }
        : { slug: validatedNumericQuestion.questionSpecificationSlug };

      const questionSpecification = await QuestionSpecification.findOne({ where: condition });
      if (!questionSpecification) return next(new NotFoundError('Question specification'));

      if (questionSpecification.questionType !== 'numericQuestion')
        return next(new StatusError("The question specification type doesn't match the question type", 400));

      const answers = await question.getAnswers();
      for (const answer of answers) await answer.destroy();

      await numericQuestion.setQuestionSpecification(questionSpecification);
      await question.save();
    } else {
      await question.save();
    }

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};

export const tryCreateChoiceQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      value: validatedChoiceQuestion,
      error: validationError,
    }: {
      value: ChoiceQuestionIntersection;
      error?: Error;
    } = choiceQuestionCreationSchema.validate({ ...req.body, slug: slugify(req.body.title) });

    if (validationError) return next(new InvalidInputError());

    const quiz: Quiz | undefined = res.locals.quiz;
    if (!quiz) return next(new NotFoundError('Quiz'));

    const questionsWithSameSlug = await quiz.countQuestions({ where: { slug: validatedChoiceQuestion.slug } });
    if (questionsWithSameSlug > 0) return next(new DuplicationError('Question'));

    const questions = await Question.count({ where: { slug: validatedChoiceQuestion.slug } });
    if (questions > 0) return next(new DuplicationError('Question'));

    const createdChoiceQuestion = ChoiceQuestion.build({ shuffle: validatedChoiceQuestion.shuffle });

    const condition = validatedChoiceQuestion.questionSpecificationId
      ? { id: validatedChoiceQuestion.questionSpecificationId }
      : { slug: validatedChoiceQuestion.questionSpecificationSlug };

    const questionSpecification = await QuestionSpecification.findOne({ where: condition });
    if (!questionSpecification) return next(new NotFoundError('Question specification'));

    if (questionSpecification.questionType !== 'choiceQuestion')
      return next(new StatusError("The question specification type doesn't match the question type", 400));

    await createdChoiceQuestion.save();
    await createdChoiceQuestion.setQuestionSpecification(questionSpecification);

    const createdQuestion = await createQuestion(createdChoiceQuestion, validatedChoiceQuestion, req, res, next);
    if (!createdQuestion) return next(new Error());

    await quiz.addQuestion(createdQuestion);

    res.json(questionFormatter(createdQuestion));
  } catch (err) {
    next(err);
  }
};

export const tryUpdateChoiceQuestion = async (req: Request, res: Response, next: NextFunction, question: Question): Promise<void> => {
  try {
    const {
      value: validatedChoiceQuestion,
      error: validationError,
    }: {
      value: AllOptional<ChoiceQuestionIntersection>;
      error?: Error;
    } = choiceQuestionUpdateSchema.validate(req.body);

    if (validationError) return next(new InvalidInputError());

    // Update question properties
    if (validatedChoiceQuestion.title) {
      question.title = validatedChoiceQuestion.title;
      question.slug = slugify(validatedChoiceQuestion.title) || question.slug;
    }

    if (validatedChoiceQuestion.description) question.description = validatedChoiceQuestion.description;

    const choiceQuestion = await question.getChoiceQuestion();
    if (!choiceQuestion) return next(new NotFoundError('Choice Question'));

    if (validatedChoiceQuestion.shuffle) choiceQuestion.shuffle = validatedChoiceQuestion.shuffle;

    // Update choice question properties
    if (validatedChoiceQuestion.questionSpecificationId || validatedChoiceQuestion.questionSpecificationSlug) {
      const condition = validatedChoiceQuestion.questionSpecificationId
        ? { id: validatedChoiceQuestion.questionSpecificationId }
        : { slug: validatedChoiceQuestion.questionSpecificationSlug };

      const questionSpecification = await QuestionSpecification.findOne({ where: condition });
      if (!questionSpecification) return next(new NotFoundError('Question specification'));

      if (questionSpecification.questionType !== 'choiceQuestion')
        return next(new StatusError("The question specification type doesn't match the question type", 400));

      const choices = await choiceQuestion.getChoices();
      for (const choice of choices) await choice.destroy();

      await choiceQuestion.save();
      await choiceQuestion.setQuestionSpecification(questionSpecification);
      await question.save();
    } else {
      await choiceQuestion.save();
      await question.save();
    }

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
};

export const hasQuizRemainingQuestions = async (quizId: number, userId: number): Promise<boolean> => {
  const quizQuestions = await Question.findAll({
    include: [
      { model: Quiz, where: { id: quizId }, attributes: [] },
      { model: UserAnswer, attributes: [], where: { userId: userId }, required: false },
    ],
    group: ['question.id'],
  });

  return quizQuestions.some((question) => question?.userAnswers?.length === 0);
};

export const getAnsweredAndRemainingQuestions = async (
  quizId: number,
  userId: number
): Promise<{
  answeredQuestions: Array<Question>;
  remainingQuestions: Array<Question>;
}> => {
  const quizQuestions = await Question.findAll({
    include: [
      { model: Quiz, where: { id: quizId }, attributes: [] },
      { model: UserAnswer, attributes: [], where: { userId: userId }, required: false },
    ],
    attributes: {
      include: [[Sequelize.fn('COUNT', Sequelize.col('userAnswers.id')), 'userAnswerCount']],
    },
    group: ['question.id'],
  });

  // * When using the fn() function, sequelize add the value to the dataValues but doesn't eager loads it
  // * so when retrieving the value, it's needed to retrieve it from the dataValues.

  const answeredQuestions = quizQuestions.filter(({ dataValues: { userAnswerCount } }) => userAnswerCount && userAnswerCount > 0);
  const remainingQuestions = quizQuestions.filter(({ dataValues: { userAnswerCount } }) => !userAnswerCount || userAnswerCount === 0);

  return { answeredQuestions, remainingQuestions };
};

export const getValidQuestionConditions = (userId: number): WhereOptions => {
  // Get every choice quesiton which have at least
  const questionWithChoiceQuery = oneLine(`
    SELECT Question.id FROM Question 
    JOIN ChoiceQuestion ON Question.typedQuestionId = ChoiceQuestion.id 
    LEFT OUTER JOIN Choice ON Choice.choiceQuestionId = ChoiceQuestion.id 
    WHERE Question.questionType = 'choiceQuestion' AND Choice.id IS NOT NULL
    GROUP BY Question.id
  `);

  // Fetch every textual question which haven't a 'manual' verification type
  // and which have at least one answer
  const automaticAndHybrideQuestionWithAnswerQuery = oneLine(`
    SELECT Question.id FROM Question
    JOIN TextualQuestion ON Question.typedQuestionId = TextualQuestion.id
    JOIN VerificationType ON TextualQuestion.verificationTypeId = VerificationType.id
    LEFT OUTER JOIN Answer ON Answer.questionId = Question.id
    WHERE Question.questionType = 'textualQuestion' AND NOT VerificationType.slug = 'manuel' AND Answer.id IS NOT NULL
    GROUP BY Question.id
  `);

  // Fetch every textual questoin which have a 'manual' verification type
  const manualTextualQuestionQuery = oneLine(`
    SELECT Question.id FROM Question
    JOIN TextualQuestion ON Question.typedQuestionId = TextualQuestion.id
    JOIN VerificationType ON TextualQuestion.verificationTypeId = VerificationType.id
    WHERE VerificationType.slug = 'manuel' AND Question.questionType = 'textualQuestion'
  `);

  // Fetch every numeric question which have at least one answer
  const numericQuestionQuery = oneLine(`
    SELECT Question.id FROM Question
    LEFT OUTER JOIN Answer ON Answer.questionId = Question.id
    WHERE Question.questionType = 'numericQuestion' AND Answer.id IS NOT NULL
    GROUP BY Question.id
  `);

  // Get every questions which have a user answer associated with the given userId
  const questionWithAnswers = oneLine(`
    SELECT Question.id FROM Question
    LEFT OUTER JOIN UserAnswer ON Question.id = UserAnswer.questionId AND UserAnswer.userId = ${userId}
    WHERE UserAnswer.id IS NOT NULL
  `);

  // Combine all the queries
  const combinedQueries = oneLine(`
    SELECT Question.id FROM Question
    WHERE (
      Question.id IN (${manualTextualQuestionQuery}) OR
      Question.id IN (${automaticAndHybrideQuestionWithAnswerQuery}) OR
      Question.id IN (${questionWithChoiceQuery}) OR
      Question.id IN (${numericQuestionQuery})
    ) AND NOT Question.id IN (${questionWithAnswers})
  `);

  return {
    id: { [Op.in]: sequelize.literal(`(${combinedQueries})`) },
    typedQuestionId: { [Op.not]: null },
  };
};

const questionToCorrectQuery = oneLine(`
  SELECT Question.id FROM Question
    JOIN TextualQuestion ON Question.typedQuestionId = TextualQuestion.id
    JOIN VerificationType ON TextualQuestion.verificationTypeId = VerificationType.id
    JOIN UserAnswer ON UserAnswer.questionId = Question.id AND UserAnswer.valid IS NULL
  WHERE Question.questionType = 'textualQuestion' AND VerificationType.slug = 'manuel'
`);

export const getQuizQuestionsToAnswer = async (quiz: Quiz): Promise<Array<Question>> => {
  const questions = await quiz.getQuestions({
    where: { [Op.and]: [{ id: { [Op.in]: sequelize.literal(`(${questionToCorrectQuery})`) } }] },
    include: [{ model: UserAnswer, attributes: ['id', 'answerContent'], where: { valid: null } }],
  });

  return questions;
};

export const getQuizQuestionToAnswer = async (quiz: Quiz, questionId: number, userAnswerId?: number): Promise<Question | null> => {
  const [question] = await quiz.getQuestions({
    where: { [Op.and]: [{ id: { [Op.in]: sequelize.literal(`(${questionToCorrectQuery})`) } }, { id: questionId }] },
    include: [{ model: UserAnswer, attributes: ['id', 'answerContent'], where: userAnswerId ? { id: userAnswerId, valid: null } : { valid: null } }],
    limit: 1,
  });

  return question;
};
