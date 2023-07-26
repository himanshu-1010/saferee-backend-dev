const { MongoClient, Collection } = require("mongodb");
const client = new MongoClient(process?.env?.MONGO_DB_SERVER);

/**
 * Exports main database connection
 */
exports.dbConnect = async (callback = () => {}) => {
  try {
    await client?.connect();
    console.log("Connection established with the database server");
    callback();
  } catch (error) {
    console.log("Database server not connected");
    Promise.reject(error);
  }
};

/**
 * Exports main database client
 */
exports.db = client;

/**
 * Exports other useful Classes
 */
exports.Collection = Collection;