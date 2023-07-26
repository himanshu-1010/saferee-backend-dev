// authentication-error
class AuthError extends Error {
  constructor(message, code = 401) {
    super(message);
    this.name = "UnauthorizedError";
    this.code = code;
  }
}

// validation-error class
class ValidationError extends Error {
  constructor(message, code = 400) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
  }
}

// application-failure-error class
class ApplicationError extends Error {
  constructor(message, code = 422) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
  }
}

module.exports = {
  AuthError,
  ValidationError,
  ApplicationError,
};
