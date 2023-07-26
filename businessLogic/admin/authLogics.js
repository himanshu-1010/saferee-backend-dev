const { Admin, MasterAdmin } = require("../../db");
const { hashPassword, comparePasswordSync } = require("../../libs/passwordLib");
const { ApplicationError, AuthError } = require("../../libs/errorLib");
const { generateAccessToken } = require("../../libs/tokenLib");
const { UserTypes } = require("../../config/constants");

// login
exports.login = async ({ reqBody = {} }) => {
  try {
    const { email, password } = reqBody;

    const masterAdmin = await MasterAdmin?.findByEmail(email);

    if (!masterAdmin) {
      throw new ApplicationError(
        `No such registered admin found. Please register yourself.`
      );
    }

    const AdminCollection = Admin?.collection(masterAdmin?.orgDb);

    /**
     * Check if admin with email exist or not
     */
    const admin = await AdminCollection?.findOne({ email });

    if (!admin) {
      throw new ApplicationError(
        `No such registered admin found. Please register yourself.`
      );
    }

    if (
      !comparePasswordSync({ plainText: password, hashedText: admin?.password })
    ) {
      throw new AuthError(`Invalid credentials.`);
    }

    /**
     * Generate Access token
     */
    const token = generateAccessToken({
      data: {
        orgId: admin?.orgId,
        orgDb: admin?.orgDb,
        adminId: admin?.adminId,
        type: UserTypes?.Admin,
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
     * Check if admin on email exist or not
     */
    const adminExist = await MasterAdmin?.collection?.findOne({ email });

    if (!adminExist) {
      throw new ApplicationError(`No such user found`);
    }

    const AdminCollection = Admin?.collection(adminExist?.orgDb);

    return true;
  } catch (error) {
    throw error;
  }
};
