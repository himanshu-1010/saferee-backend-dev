const { nanoid } = require("nanoid");
const { db, Collection } = require("../../config/db");
const { now } = require("../../libs/timeLib");

exports.defaultPayload = () => {
  return {
    orgId: process?.env?.DEFAULT_ROOT_ORG_ID,
    orgDb: process?.env?.DEFAULT_ROOT_ORG_DB,
    adminId: nanoid(),
    name: "",
    email: "",
    password: "",
    isActive: true,
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
  db?.db(dbName || process?.env?.DEFAULT_ROOT_ORG_DB)?.collection("Admin");
