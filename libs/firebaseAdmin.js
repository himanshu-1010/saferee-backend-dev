const path = require("path");
const admin = require("firebase-admin");

/**
 * Prepare service account
 */
const serviceAccount = require(path.join(
  global?.rootPath,
  "config",
  "dev-safelet-firebase-adminsdk-uqpkj-eb79178cd6.json"
));

/**
 * Initialise Firebase Admin SDK
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.sendFcmNotification = async (message) => {
  try {
    const fcmResp = await admin.messaging().send(message);
    console.log("Successfully sent message:", fcmResp);
    return {error: 0, success: 1, msg: "Success"};
  } catch (error) {
    console.log("Error sending message:", error);
    return {error: 1, success: 0, msg: error?.message};
  }
};

exports.createFirebaseAuthToken = async (userId = "") => {
  try {
    const token = userId?.length > 0 ? await admin?.auth()?.createCustomToken(userId) : "";
    console.log("userId", userId, "token", token);
    return { token };
  } catch (error) {
    throw error;
  }
};
