const { asyncHandler } = require("../../libs/asyncHandler");
const { generateResponse } = require("../../libs/response");

exports.apiHomeSuccess = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['Public']
   * #swagger.description = 'Public Home API Endpoint'
   */
  generateResponse({
    res,
    message: `API Home Success`,
  });
  next();
});
