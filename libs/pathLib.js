const { dirname } = require("path");

exports.rootPath = dirname(require?.main?.filename);
