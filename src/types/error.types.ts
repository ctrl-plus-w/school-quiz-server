import StatusError, {
  AcccessForbiddenError,
  DuplicationError,
  ForbiddenAccessParameterError,
  InvalidCredentialsError,
  InvalidInputError,
  ModelRoleDuplicationError,
  NotFoundError,
  UnknownError,
} from '../classes/StatusError';

export type ErrorsUnion =
  | Error
  | StatusError
  | UnknownError
  | AcccessForbiddenError
  | InvalidInputError
  | DuplicationError
  | NotFoundError
  | InvalidCredentialsError
  | ModelRoleDuplicationError
  | ForbiddenAccessParameterError;
