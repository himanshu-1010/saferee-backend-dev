const { checkSchema } = require("express-validator");

// update group validations
exports.groupSchema = checkSchema({
  id: {
    in: ["body"],
    optional: true,
    isString: {
      bail: true,
      errorMessage: `Group Id should be string`,
    },
    trim: true,
  },
  name: {
    in: ["body"],
    errorMessage: `Group name is missing`,
    notEmpty: {
      bail: true,
      errorMessage: `Group name should not be empty`,
    },
    isString: {
      bail: true,
      errorMessage: `Group name should be string`,
    },
    trim: true,
  },
  description: {
    in: ["body"],
    optional: true,
    isString: {
      bail: true,
      errorMessage: `Group description should be string`,
    },
    trim: true,
  },
});

// update sub-group validations
exports.subGroupSchema = checkSchema({
  id: {
    in: ["body"],
    optional: true,
    isString: {
      bail: true,
      errorMessage: `Sub-Group Id should be string`,
    },
    trim: true,
  },
  groupId: {
    in: ["body"],
    isString: {
      bail: true,
      errorMessage: `Group Id should be string`,
    },
    trim: true,
  },
  name: {
    in: ["body"],
    errorMessage: `Sub-Group name is missing`,
    notEmpty: {
      bail: true,
      errorMessage: `Sub-Group name should not be empty`,
    },
    isString: {
      bail: true,
      errorMessage: `Sub-Group name should be string`,
    },
    trim: true,
  },
  description: {
    in: ["body"],
    optional: true,
    isString: {
      bail: true,
      errorMessage: `Sub-Group description should be string`,
    },
    trim: true,
  },
});

// update password
exports.passwordUpdateSchema = checkSchema({
  currentPassword: {
    in: ["body"],
    errorMessage: `Current Password is missing`,
    notEmpty: {
      errorMessage: `Current Password cannot be empty`,
      bail: true,
    },
    trim: true,
  },
  newPassword: {
    in: ["body"],
    errorMessage: `New Password is missing`,
    notEmpty: {
      errorMessage: `New Password cannot be empty`,
      bail: true,
    },
    trim: true,
    custom: {
      if: (value, { req }) => value == req?.body?.currentPassword,
      bail: true,
      errorMessage: `New password and current password cannot be same.`,
    },
  },
});

// create/update user
exports.userUpdateSchema = checkSchema({
  id: {
    in: ["body"],
    optional: true,
    trim: true,
  },
  name: {
    in: ["body"],
    optional: true,
    errorMessage: `Name is missing`,
    isString: {
      errorMessage: `Name should be string`,
      bail: true,
    },
    trim: true,
  },
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
  mobile: {
    in: ["body"],
    optional: true,
    errorMessage: `Mobile is missing`,
    isNumeric: {
      bail: true,
      errorMessage: `Mobile should be number`,
    },
    trim: true,
  },
  mobileCountryCode: {
    in: ["body"],
    optional: true,
    errorMessage: `Mobile country code is missing`,
    isNumeric: {
      bail: true,
      errorMessage: `Mobile country code should be number`,
    },
    trim: true,
  },
  groupId: {
    in: ["body"],
    optional: true,
    errorMessage: `Group Id is missing`,
    isString: {
      bail: true,
      errorMessage: `Group Id should be string`,
    },
    trim: true,
  },
  subGroupId: {
    in: ["body"],
    optional: true,
    errorMessage: `Sub-Group Id is missing`,
    isString: {
      bail: true,
      errorMessage: `Sub-Group Id should be string`,
    },
    trim: true,
  },
});