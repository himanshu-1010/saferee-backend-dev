const { sign, verify, decode } = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { isEmpty } = require("lodash");
const { encryptString } = require("./encryptionLib");
const tokenSecret = process?.env?.TOKEN_SECRET;

// generate auth-access token
exports.generateAccessToken = ({data = undefined, expiresIn = "24h", issuer = "API", audience = "AuthToken", subject = "AccessToken"}) => {
  data = encryptString(JSON.stringify(data));
  // console.log(data);
  return sign({data}, tokenSecret, {
    audience: audience,
    issuer: issuer,
    subject: subject,
    expiresIn: expiresIn,
  });
};

// validate access-token
exports.validateToken = (token) => {
  return new Promise((resolve, reject) => {
    verify(token, tokenSecret, (err, decoded) => {
      if (err) {
        reject(err);
      } else if (isEmpty(decoded)) {
        reject(new Error("Failed To Authenticate"));
      } else {
        resolve(decoded);
      }
    });
  });
};

// decode token value
exports.decodeToken = (token) => {
  return decode(token, { complete: false });
};

// generate unique crypto token
exports.generateCryptoToken = () => {
  return randomBytes(256).toString("hex");
};
