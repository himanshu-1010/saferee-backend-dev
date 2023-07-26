const { nanoid } = require("nanoid");
const { db, Collection } = require("../../config/db");
const { now } = require("../../libs/timeLib");

exports.defaultPayload = () => {
  return {
    alarmId: nanoid(),
    userId: "",
    location: {
      raw: null,
      latitude: null,
      longitude: null,
    },
    address: "",
    description: "I'm here",
    chunkFiles: [],
    guardianUserIds: [],
    isPublished: true,
    isActive: true,
    reasonTitle: "",
    reasonDescription: "",
    reasonId: "",
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
  db?.db(dbName || process?.env?.DEFAULT_ROOT_ORG_DB)?.collection("Alarms");
