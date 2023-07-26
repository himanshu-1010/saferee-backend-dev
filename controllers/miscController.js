const { getLocalTimeString } = require("./../libs/timeLib");
const makeDir = require("make-dir");
const { appendFile } = require("fs");
const moment = require("moment");

const logDir = "app-logs";

makeDir(logDir);

exports.error404 = (req, res, next) => {
  res
    .status(404)
    .json({
      code: 404,
      success: false,
      error: true,
      message: `Bad request`,
      data: {},
    })
    .end();
};

exports.setApiRes = (req, res, next) => {
  // console.log(req.body);
  // console.log(res);
  res.locals.code = 400;
  res.locals.success = false;
  res.locals.error = true;
  res.locals.message = `Bad request`;
  res.locals.data = {};
  if (req?.url !== "/favicon.ico") {
    res.locals.logger = {
      request: {
        hostname: req?.hostname,
        ip: req?.ip,
        url: req?.url,
        path: req?.path,
        method: req?.method,
        body: req?.body,
        params: req?.params,
        query: req?.query,
        headers: req?.headers,
        requestInAt: moment().utc(),
      },
      response: null,
      data: null,
      errors: null,
    };
  }
  next();
};

exports.returnApiRes = (req, res, next) => {
  // console.log(res.locals.message);
  if (
    res?.locals?.logger &&
    Object.keys(res?.locals?.logger)?.length > 0 &&
    req?.url !== "/favicon.ico"
  ) {
    res.locals.logger.response = {
      code: res?.locals?.code,
      success: res?.locals?.success,
      error: res?.locals?.error,
      message: res?.locals?.message,
      responseOutAt: moment().utc(),
    };
    res.locals.logger.executionTime = moment(
      res?.locals?.logger?.response?.responseOutAt
    ).diff(moment(res?.locals?.logger?.request?.requestInAt), "milliseconds");
    // console.log("===========res.locals.logger===============\r\n", res.locals.logger);
    appendFile(
      `${logDir}/${getLocalTimeString("DD_MM_YYYY")}_logs.log`,
      `${JSON.stringify(res.locals.logger)}\r\n`,
      () => {}
    );
  }
  res
    .status(res?.locals?.code)
    .json({
      code: res?.locals?.code,
      success: res?.locals?.success,
      error: res?.locals?.error,
      data: res?.locals?.data,
      message: res?.locals?.message,
    })
    .end();
};

exports.serverError = (err, req, res, next) => {
  let code = 500;
  let message =
    "Your request could not be processed. Please try after some time.";

  res.locals.logger.errors = {
    ...res.locals.logger.errors,
    errorMessage: err?.message,
    errorName: err?.name,
    errorStack: err?.stack,
  };

  console.log("error", err.name, err);

  switch (true) {
    case typeof err === "string":
      // custom application error
      const is404 = err.toLowerCase().endsWith("not found");
      code = is404 ? 404 : 400;
      break;
    case err.name === "ValidationError":
      // validation error
      code = err?.code || 400;
      message = err?.message || `Validations failed`;
      break;
    case err.name === "ApplicationError":
      // validation error
      code = err?.code || 422;
      message = err?.message || `Failure`;
      break;
    case err.name === "UnauthorizedError" ||
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError":
      // jwt authentication error
      code = err?.code || 401;
      message = err?.message || `Unauthorized`;
      break;
    default:
      code = 500;
  }

  if (code == 500 && ["prod"].includes(global.config.config_environment)) {
    // notify developers of the critical error
    console.log(
      `====================notify developers of the critical error================`
    );
  }

  res.locals.code = code;
  res.locals.success = false;
  res.locals.error = true;
  res.locals.message = message;

  next();
};
