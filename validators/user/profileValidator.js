const { checkSchema } = require("express-validator");

// update profile validations
exports.profileSchema = checkSchema({
  email: {
    in: ["body"],
    optional: true,
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
  name: {
    in: ["body"],
    optional: true,
    errorMessage: `Name is missing`,
    isString: {
      bail: true,
      errorMessage: `Name should be string`,
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
  safeletNetwork: {
    in: ["body"],
    optional: true,
    errorMessage: `Mobile country code is missing`,
    isBoolean: {
      bail: true,
      errorMessage: `Safelet network join flag should be boolean`,
    },
    toBoolean: true,
  },
  termsAccepted: {
    in: ["body"],
    optional: true,
    errorMessage: `Terms accepted or not is missing`,
    isBoolean: {
      bail: true,
      errorMessage: `Accepted terms flag should be boolean`,
    },
    toBoolean: true,
  },
  location: {
    in: ["body"],
    optional: true,
    errorMessage: `Location co-ordinates are missing`,
    notEmpty: {
      errorMessage: `Location co-ordinates cannot be empty`,
      bail: true,
    },
    isLatLong: {
      errorMessage: `Location co-ordinates should be in the form of latitude & longitude`,
      bail: true,
    },
  },
  locationAddress: {
    in: ["body"],
    optional: true,
    notEmpty: {
      errorMessage: `Location address cannot be empty`,
      bail: true,
    },
    isString: {
      errorMessage: `Location address should be text only`,
      bail: true,
    },
  },
});

// update fcm-schema validations
exports.fcmTokenSchema = checkSchema({
  fcmToken: {
    in: ["body"],
    errorMessage: `FCM Token is missing`,
    isString: {
      bail: true,
      errorMessage: `FCM Token should be string`,
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

// sync user phonebook
exports.phoneBookSchema = checkSchema({
  myContacts: {
    in: ["body"],
    errorMessage: `Contacts are missing`,
    notEmpty: {
      errorMessage: `Sync contacts cannot be empty`,
      bail: true,
    },
    isArray: {
      errorMessage: `Sync contacts should be an array`,
      bail: true,
    },
  },
  "myContacts.*": {
    in: ["body"],
    errorMessage: `Contacts are missing`,
    isNumeric: {
      errorMessage: `Each element should be a number only`,
      bail: true,
    },
  },
});

// location check-in schema
exports.locationCheckInSchema = checkSchema({
  location: {
    in: ["body"],
    errorMessage: `Location co-ordinates are missing`,
    notEmpty: {
      errorMessage: `Location co-ordinates cannot be empty`,
      bail: true,
    },
    isLatLong: {
      errorMessage: `Location co-ordinates should be in the form of latitude & longitude`,
      bail: true,
    },
  },
  address: {
    in: ["body"],
    notEmpty: {
      errorMessage: `Location address cannot be empty`,
      bail: true,
    },
    isString: {
      errorMessage: `Location address should be text only`,
      bail: true,
    },
  },
  description: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: `Description should be text-based only`,
      bail: true,
    },
  },
});

// location follow-me schema
exports.locationFollowMeSchema = checkSchema({
  location: {
    in: ["body"],
    errorMessage: `Location co-ordinates are missing`,
    notEmpty: {
      errorMessage: `Location co-ordinates cannot be empty`,
      bail: true,
    },
    isLatLong: {
      errorMessage: `Location co-ordinates should be in the form of latitude & longitude`,
      bail: true,
    },
  },
  address: {
    in: ["body"],
    notEmpty: {
      errorMessage: `Location address cannot be empty`,
      bail: true,
    },
    isString: {
      errorMessage: `Location address should be text only`,
      bail: true,
    },
  },
  guardianUserIds: {
    in: ["body"],
    notEmpty: {
      errorMessage: `Guardians cannot be empty`,
      bail: true,
    },
    isArray: {
      errorMessage: `Guardians should be array only`,
      bail: true,
    },
  },
  "guardianUserIds.*": {
    in: ["body"],
    notEmpty: {
      errorMessage: `Guardian user id cannot be empty`,
      bail: true,
    },
    isString: {
      errorMessage: `Guardian user id is invalid`,
      bail: true,
    },
  },
});

// sos update by user schema
exports.sosAlarmUpdateSchema = checkSchema({
  alarmId: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: `Alarm Id should be text only`,
      bail: true,
    },
  },
  location: {
    in: ["body"],
    exists: {
      if: (value, { req }) => req?.body?.alarmId?.length > 0,
      bail: true,
      errorMessage: `Please provide the location`,
    },
    notEmpty: {
      errorMessage: `Location co-ordinates cannot be empty`,
      bail: true,
    },
    isLatLong: {
      errorMessage: `Location co-ordinates should be in the form of latitude & longitude`,
      bail: true,
    },
  },
  address: {
    in: ["body"],
    exists: {
      if: (value, { req }) => req?.body?.alarmId?.length > 0,
      bail: true,
      errorMessage: `Please provide the location address`,
    },
    notEmpty: {
      errorMessage: `Location address cannot be empty`,
      bail: true,
    },
    isString: {
      errorMessage: `Location address should be text only`,
      bail: true,
    },
  },
});

// raise support schema
exports.raiseSupportSchema = checkSchema({
  title: {
    in: ["body"],
    errorMessage: `Issue title is missing`,
    notEmpty: {
      errorMessage: `Issue title cannot be empty`,
      bail: true,
    },
    isString: {
      errorMessage: `Issue title should be string`,
      bail: true,
    },
    trim: true,
  },
  description: {
    in: ["body"],
    errorMessage: `Issue description is missing`,
    notEmpty: {
      errorMessage: `Issue description cannot be empty`,
      bail: true,
    },
    isString: {
      errorMessage: `Issue description should be string`,
      bail: true,
    },
    trim: true,
  },
});