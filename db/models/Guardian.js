const { nanoid } = require("nanoid");
const { GuardianRequestStatus } = require("../../config/constants");
const { db, Collection } = require("../../config/db");
const { now } = require("../../libs/timeLib");

exports.defaultPayload = () => {
  return {
    guardianId: nanoid(),
    requestTo: {
      userId: "",
      phoneNumber: "",
    },
    requestFrom: {
      userId: "",
      phoneNumber: "",
    },
    removed: {
      userId: "",
      by: ""
    },
    requestStatus: GuardianRequestStatus?.Invited,
    isPublished: true,
    created: now(),
    lastModified: now(),
  };
};

/**
 *
 * @param {String} dbName
 * @returns {Collection}
 */
exports.collection = (dbName = process?.env?.DEFAULT_ROOT_ORG_DB) =>
  db?.db(dbName || process?.env?.DEFAULT_ROOT_ORG_DB)?.collection("Guardian");
