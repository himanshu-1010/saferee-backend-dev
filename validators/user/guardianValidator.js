const { checkSchema } = require("express-validator");
const { GuardianRequestActions } = require("../../config/constants");

// invite-guardian
exports.inviteGuardianSchema = checkSchema({
  mobile: {
    in: ["body"],
    errorMessage: `Mobile is missing`,
    isNumeric: {
      errorMessage: `Mobile should be a number only`,
      bail: true,
    },
    trim: true,
  },
});

// action-on-guardian-invite
exports.actionGuardianInviteSchema = checkSchema({
  guardianId: {
    in: ["params"],
    errorMessage: `Guardian Id is missing`,
    trim: true,
  },
  action: {
    in: ["params"],
    errorMessage: `Action type is missing`,
    isString: {
      errorMessage: `Action type should be string only`,
      bail: true,
    },
    trim: true,
    isIn: {
      options: [Object?.values(GuardianRequestActions)],
      bail: true,
      errorMessage: `Action type value is invalid`,
    },
  },
});