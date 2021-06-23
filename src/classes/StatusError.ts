export default class StatusError {
  public message!: string;
  public status!: number;

  constructor(message: string, status: number = 500) {
    this.message = message;
    this.status = status;
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
