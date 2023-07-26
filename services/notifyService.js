const { User } = require("../db");
const { sendFcmNotification } = require("../libs/firebaseAdmin");

exports.notifyFcm = async ({
  title = undefined,
  body = undefined,
  type = undefined,
  data = undefined,
  orgDb = undefined,
  userIds = [],
}) => {
  const UserCollection = User?.collection(orgDb);
  const userRecords = await UserCollection?.find({
    userId: { $in: userIds },
  })?.toArray();
  for (const elUser of userRecords) {
    const fcmToken = elUser?.fcmToken;
    console.log("fcmToken", fcmToken);
    if (fcmToken) {
      await sendFcmNotification({
        data: {
          ...data,
          type,
        },
        notification: {
          title: title,
          body: body || title,
        },
        token: fcmToken,
      });
    }
  }
};
