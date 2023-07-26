const { User, MasterUser } = require("../../db");
const { hashPassword, comparePasswordSync } = require("../../libs/passwordLib");
const { ApplicationError, AuthError } = require("../../libs/errorLib");
const { generateAccessToken } = require("../../libs/tokenLib");
const { UserTypes } = require("../../config/constants");

// login
exports.login = async ({ reqBody = {} }) => {
  try {
    const { email, password } = reqBody;

    const masterUser = await MasterUser?.findByEmail(email);

    if (!masterUser) {
      throw new ApplicationError(
        `No such registered user found. Please register yourself.`
      );
    }

    const UserCollection = User?.collection(masterUser?.orgDb);

    /**
     * Check if user with email exist or not
     */
    const user = await UserCollection?.findOne({ email });

    if (!user) {
      throw new ApplicationError(
        `No such registered user found. Please register yourself.`
      );
    }

    if (
      !comparePasswordSync({ plainText: password, hashedText: user?.password })
    ) {
      throw new AuthError(`Invalid credentials.`);
    }

    /**
     * Generate Access token
     */
    const token = generateAccessToken({
      data: {
        orgId: user?.orgId,
        orgDb: user?.orgDb,
        userId: user?.userId,
        type: UserTypes?.User,
      },
    });

    return token;
  } catch (error) {
    throw error;
  }
};

// register
exports.register = async ({ reqBody = {} }) => {
  try {
    const { email, password, termsAccepted } = reqBody;

    const payload = {
      ...User?.defaultPayload(),
      email,
      password: hashPassword(password),
      termsAccepted,
    };

    const UserCollection = User?.collection();

    /**
     * Check if email already exist or not
     */
    const emailInUse = await MasterUser?.collection?.countDocuments({ email });

    if (emailInUse) {
      throw new ApplicationError(`Email is already in use`);
    }

    /**
     * Create new user record
     */
    const createUser = await UserCollection?.insertOne(payload);

    if (!createUser?.acknowledged) {
      throw new ApplicationError(
        `Unable to register. Please try after some time.`
      );
    }

    /**
     * Create new user record in the master users
     */
    await MasterUser?.insertOne(payload);

    /**
     * Generate Access token
     */
    const token = generateAccessToken({
      data: {
        orgId: payload?.orgId,
        orgDb: payload?.orgDb,
        userId: payload?.userId,
        type: UserTypes?.User,
      },
    });

    return token;
  } catch (error) {
    throw error;
  }
};

// forgot password
exports.forgotPassword = async ({ reqBody = {} }) => {
  try {
    const { email } = reqBody;

    /**
     * Check if user on email exist or not
     */
    const userExist = await MasterUser?.collection?.findOne({ email });

    if (!userExist) {
      throw new ApplicationError(`No such user found`);
    }

    const UserCollection = User?.collection(userExist?.orgDb);

    return true;
  } catch (error) {
    throw error;
  }
};
