const { checkSchema } = require("express-validator");

// login validations
exports.loginSchema = checkSchema({
  email: {
    in: ["body"],
    errorMessage: `Email is missing`,
    notEmpty: {
      errorMessage: `Email cannot be empty`,
      bail: true,
    },
    isEmail: {
      errorMessage: `Email provided is not valid`,
      bail: true,
    },
    normalizeEmail: {
      options: {
        all_lowercase: true,
      },
    },
    trim: true,
  },
  password: {
    in: ["body"],
    errorMessage: `Password is missing`,
    notEmpty: {
      errorMessage: `Password cannot be empty`,
      bail: true,
    },
    trim: true,
  },
});

// forgot password validations
exports.forgotPasswordSchema = checkSchema({
  email: {
    in: ["body"],
    errorMessage: `Email is missing`,
    notEmpty: {
      errorMessage: `Email cannot be empty`,
      bail: true,
    },
    isEmail: {
      errorMessage: `Email provided is not valid`,
      bail: true,
    },
    normalizeEmail: {
      options: {
        all_lowercase: true,
      },
    },
    trim: true,
  },
});