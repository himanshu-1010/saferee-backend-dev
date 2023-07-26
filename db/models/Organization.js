const { now } = require("lodash");
const { nanoid } = require("nanoid");
const { db, Collection } = require("../../config/db");

exports.defaultPayload = () => {
  return {
    orgId: nanoid(),
    orgDb: "",
    name: "",
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
exports.collection = (dbName = process?.env?.MASTER_DB) =>
  db?.db(dbName || process?.env?.MASTER_DB)?.collection(`Organization`);
