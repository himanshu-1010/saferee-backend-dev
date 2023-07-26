const moment = require("moment");
const momentTz = require("moment-timezone");
const timeZone = "Asia/Calcutta";

exports.now = () => {
  return moment.utc().format();
};

exports.getLocalTimeString = (format = "DD/MM/YYYY") => {
  return momentTz.tz(timeZone).format(format);
};
