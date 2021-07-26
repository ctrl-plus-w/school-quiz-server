export default class StatusError {
  public message!: string;
  public status!: number;

  constructor(message: string, status = 500) {
    this.message = message;
    this.status = status;
  }
}

export class UnknownError extends StatusError {
  constructor() {
    super('Something wrong happened', 400);
  }
}

export class AcccessForbiddenError extends StatusError {
  constructor() {
    super(`Access forbidden`, 403);
  }
}

export class InvalidInputError extends StatusError {
  constructor() {
    super(`One of the parameters is invalid.`, 422);
  }
}

export class DuplicationError extends StatusError {
  constructor(thing: string) {
    super(`${thing} already exists`, 409);
  }
}

export class NotFoundError extends StatusError {
  constructor(thing: string) {
    super(`${thing} not found`, 404);
  }
}

export class InvalidCredentialsError extends StatusError {
  constructor() {
    super(`The username or the password is invalid.`, 422);
  }
}

export class ModelRoleDuplicationError extends StatusError {
  constructor() {
    super(`The owner of the event cannot collaborate on his own project`, 409);
  }
}

export class ForbiddenAccessParameterError extends StatusError {
  constructor() {
    super("Collaborator doesn't have the right permissions", 422);
  }
}
