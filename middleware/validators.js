const { validationResult } = require("express-validator");
const { ValidationError } = require("../libs/errorLib");
exports.validateRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.locals.logger.errors = errors?.mapped();
      throw new ValidationError(errors?.array()[0]?.msg);
    }
    next();
  } catch (error) {
    next(error);
  }
};
