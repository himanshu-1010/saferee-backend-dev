const {
  register,
  login,
  forgotPassword,
} = require("../../businessLogic/user/authLogics");
const { asyncHandler } = require("../../libs/asyncHandler");
const { generateResponse } = require("../../libs/response");
const { TokenKeys } = require("../../config/constants");
const { setResHeader } = require("../../libs/utilsLib");

/**
 * Login API
 */
exports.login = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/Auth']
   * #swagger.description = 'User Login API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Login',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/Login' }
        }
      }
    }
   */
  const token = await login({ reqBody: req?.body });
  console.log(token);
  const success = Boolean(token?.length > 0);
  if (success) {
    setResHeader(res, TokenKeys?.AccessToken, token);
  }
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Register API
 */
exports.register = asyncHandler(async (req, res, next) => {
  console.log(req);
  console.log(res);
  /**
   * #swagger.tags = ['User/Auth']
   * #swagger.description = 'User Register API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Register',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/Register' }
        }
      }
    }
   */
  const token = await register({ reqBody: req?.body });
  console.log(token);
  const success = Boolean(token?.length > 0);
  if (success) {
    setResHeader(res, TokenKeys?.AccessToken, token);
  }
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Forgot Password API
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  /**
   * #swagger.tags = ['User/Auth']
   * #swagger.description = 'Forgot Password API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Forgot Password',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/ForgotPassword' }
        }
      }
    }
   */
  const success = Boolean(await forgotPassword({ reqBody: req?.body }));
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Password reset email sent successfully.` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});
