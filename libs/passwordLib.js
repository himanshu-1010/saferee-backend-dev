const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { generate } = require('generate-password');
const saltRounds = 10;

// hash plain text
exports.hashPassword = (myPlaintextPassword) => {
  let salt = genSaltSync(saltRounds);
  let hash = hashSync(myPlaintextPassword, salt);
  return hash;
};

// compare plain text and hashed string
exports.comparePasswordSync = ({ plainText = "", hashedText = "" } = {}) => {
  return compareSync(plainText, hashedText);
};

// generate unique random password
exports.generateRandomPassword = ({ length = 10, numbers = true, symbols = true, lowercase = true, uppercase = true, excludeSimilarCharacters = false, exclude = "", strict = true, }) => {
  return generate({ length, numbers, symbols, lowercase, uppercase, excludeSimilarCharacters, exclude, strict });
};
