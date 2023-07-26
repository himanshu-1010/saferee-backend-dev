exports.generateResponse = ({
  res = undefined,
  code = 200,
  success = true,
  error = false,
  message = "Success",
  data = {},
  loggerData = undefined,
}) => {
  res.locals.code = code;
  res.locals.success = success;
  res.locals.error = error;
  res.locals.message = message;
  res.locals.data = data;
  res.locals.logger.data = loggerData;
};
