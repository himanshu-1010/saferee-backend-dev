const moment = require("moment");
const { User, Admin } = require("./../db");
const {
  validateToken,
  decodeToken,
  generateAccessToken,
} = require("../libs/tokenLib");
const { setResHeader } = require("../libs/utilsLib");
const { TokenKeys, UserTypes } = require("../config/constants");
const { AuthError } = require("./../libs/errorLib");
const {
  keys: _keys,
  values: _values,
  trim,
  isEmpty,
} = require("lodash");
const { decryptString } = require("../libs/encryptionLib");

const authAccessKeyName = TokenKeys?.AccessToken;

exports.decodeAuthToken = async (req, res, next) => {
  try {
    let accessToken = trim(req.headers[authAccessKeyName]);

    console.log("accessToken", accessToken);

    if (accessToken.startsWith("Bearer ")) {
      accessToken = accessToken?.slice(7, accessToken?.length);
    }

    if (accessToken.startsWith("Basic ")) {
      accessToken = accessToken?.slice(6, accessToken?.length);
    }

    if (!isEmpty(accessToken)) {
      const decoded = await decodeToken(accessToken);
      req.decodedToken = decryptString(decoded?.data);
    } else {
      throw new AuthError("Authentication Token missing");
    }
    next();
  } catch (error) {
    next(error);
  }
};

exports.validateAuthToken = async (req, res, next) => {
  try {
    let accessToken = trim(req.headers[authAccessKeyName]);

    if (accessToken.startsWith("Bearer ")) {
      accessToken = accessToken?.slice(7, accessToken?.length);
    }

    if (accessToken.startsWith("Basic ")) {
      accessToken = accessToken?.slice(6, accessToken?.length);
    }

    if (isEmpty(accessToken)) {
      throw new AuthError("Authentication Token missing");
    } else {
      const decoded = await validateToken(accessToken);
      req.decodedToken = decryptString(decoded?.data);
      req.user = undefined;
      {
        if (req?.decodedToken?.userId) {
          // run db query to fetch user details and append it with request to use further in the request propagation
          const UserCollection = User?.collection(req?.decodedToken?.orgDb);
          req.user = await UserCollection?.findOne({ userId: req?.decodedToken?.userId, isActive: true, isPublished: true });
        } else if (req?.decodedToken?.adminId) {
          // run db query to fetch admin details and append it with request to use further in the request propagation
          const AdminCollection = Admin?.collection(req?.decodedToken?.orgDb);
          req.user = await AdminCollection?.findOne({ adminId: req?.decodedToken?.adminId, isActive: true, isPublished: true });
        } else {
          // throw new AuthError("Authenticated User not found");
        }
        if (!req.user) {
          throw new AuthError("Authenticated User not found");
        }
      }

      if (decoded && _keys(decoded).length > 0) {
        const newAccessToken = generateAccessToken({data: req?.decodedToken, audience: decoded?.aud, issuer: decoded?.iss, subject: decoded?.sub});

        setResHeader(res, authAccessKeyName, newAccessToken);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

exports.authenticateUserType = (types) => {
  return (req, res, next) => {
    let err;
    if (
      req.decodedToken &&
      _values(UserTypes).includes(req?.decodedToken?.type)
    ) {
      if (types?.includes(req?.decodedToken?.type)) {
        next();
      } else {
        err = new AuthError("Not authorized to access");
        next(err);
      }
    } else {
      err = new AuthError("Malformed token found");
      next(err);
    }
  };
};
