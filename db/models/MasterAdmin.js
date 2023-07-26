const { nanoid } = require("nanoid");
const { db, Collection } = require("../../config/db");
const { now } = require("../../libs/timeLib");

exports.defaultPayload = () => {
  return {
    orgId: process?.env?.DEFAULT_ROOT_ORG_ID,
    orgDb: process?.env?.DEFAULT_ROOT_ORG_DB,
    masterAdminId: nanoid(),
    adminId: "",
    email: "",
    created: now(),
    lastModified: now(),
  };
};

/**
 *
 * @returns {Collection}
 */
exports.collection = db?.db(process?.env?.MASTER_DB)?.collection("MasterAdmin");

// create new record
exports.insertOne = async (payload) => {
  try {
    const insertPayload = {
      ...this.defaultPayload(),
      orgId: payload?.orgId,
      orgDb: payload?.orgDb,
      adminId: payload?.adminId,
      email: payload?.email,
    };
    return await this?.collection?.insertOne(insertPayload);
  } catch (error) {
    throw error;
  }
};

// find by email
exports.findByEmail = async (email = "") => {
  try {
    return await this?.collection?.findOne({ email });
  } catch (error) {
    throw error;
  }
};
