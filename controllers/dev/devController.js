const { asyncHandler } = require("../../libs/asyncHandler");
const { generateResponse } = require("../../libs/response");

exports.devHomeSuccess = asyncHandler(async (req, res, next) => {
  console.log('running...........');
  /**
   * #swagger.ignore = true
   */
  generateResponse({
    res,
    message: `Dev Home Success`,
  });
  next();
});
