const slugify = require("slugify");
const { parse } = require("path");
const { randomBytes, createCipheriv, createDecipheriv } = require("crypto");
const {
  maskPhone: maskPhoneData,
  maskEmail2: maskEmail2Data,
} = require("maskdata");
const algorithm = "aes-256-cbc";
const ENCRYPTION_KEY = process?.env?.CIPHER_KEY;
const IV_LENGTH = 16;

// slugify any name, like "abc def" => abc-def
exports.slugifyName = (text) => {
  return slugify(text, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
  });
};

// encrypt-string function
encryptString = (text) => {
  try {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const encData = iv.toString("hex") + ":" + encrypted.toString("hex");
    return Buffer.from(encData).toString("base64");
  } catch (error) {
    console.log(error);
    throw Error("Could not encrypt. Please communicate the same to the team.");
  }
};

// decrypt-string function
decryptString = (encText) => {
  try {
    const text = Buffer.from(encText, "base64").toString("ascii");
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = createDecipheriv(
      algorithm,
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    console.log(error);
    throw Error("Could not decrypt. Please communicate the same to the team.");
  }
};

// mask phone number like 98*****12
exports.maskPhone = (string) => {
  const maskPhoneOption = {
    maskWith: "*",
    unmaskedStartDigits: 2,
    unmaskedEndDigits: 3,
  };
  return maskPhoneData(string.toString(), maskPhoneOption);
};

// mask email like e***@email.com
exports.maskEmail = (string) => {
  const emailMask2Options = {
    maskWith: "*",
    unmaskedStartCharactersBeforeAt: 2,
    unmaskedEndCharactersAfterAt: 257,
    maskAtTheRate: false,
  };
  return maskEmail2Data(string.toString(), emailMask2Options);
};

// get file name without it's extension
exports.getNameWithoutExt = (filename) => {
  return parse(filename).name;
};

// get file extension of a filename like ".png"
exports.getExtension = (filename) => {
  return parse(filename).ext.toString().toLowerCase();
};

// get days in milli-seconds
exports.getDaysInMilliSeconds = (days = 1) => {
  return this.getDaysInSeconds(days) * 1000;
};

// get days in seconds
exports.getDaysInSeconds = (days = 1) => {
  return days * 24 * 60 * 60 * 1;
};

// set response headers
exports.setResHeader = (res, name, value) => {
  res.header(name.toString().toLowerCase(), value);
};

// function to round off the number
exports.roundOffNumber = (number, decimalPlaces) => {
  const factorOfTen = Math.pow(10, decimalPlaces);
  return Number(Math.round(number * factorOfTen) / factorOfTen);
};

// pagination-function
exports.setPaginationData = ({
  totalCount = 0,
  itemsPerPage = 0,
  currentCount = 0,
  currentPage = 0,
}) => {
  const hasMoreItems = totalCount - itemsPerPage * currentPage;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const paginateObj = {};
  paginateObj.totalItems = totalCount;
  paginateObj.currentCount = currentCount;
  paginateObj.itemsPerPage = itemsPerPage;
  paginateObj.currentPage = currentPage;
  paginateObj.hasNextPage = hasMoreItems > 0 ? true : false;
  paginateObj.hasPreviousPage = currentPage > 1 ? true : false;
  paginateObj.totalPages = totalPages;

  return paginateObj;
};

// return json parsed object else string as it is
exports.jsonString = (text = "") => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}
