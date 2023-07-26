const {
  User,
  MasterUser,
  Guardian,
  CheckIn,
  FollowMe,
  Support,
  Alarms,
} = require("../../db");
const { hashPassword, comparePasswordSync } = require("../../libs/passwordLib");
const { ApplicationError } = require("../../libs/errorLib");
const {
  map: _map,
  values: _values,
  includes: _includes,
  find: _find,
  defaultTo: _defaultTo,
  without: _without,
  pick: _pick,
} = require("lodash");
const {
  FileTypes,
  UploadFileTypes,
  GuardianRequestStatus,
  SosAlarmStopReasons,
  NotificationTypes,
} = require("../../config/constants");
const {
  checkFileType,
  uploadFile,
  getFileLink,
} = require("../../services/uploadService");
const { userGuardiansInvites, myUsers } = require("./guardianLogics");
const moment = require("moment");
const { now } = require("../../libs/timeLib");
const { getExtension } = require("../../libs/utilsLib");
const { notifyFcm } = require("../../services/notifyService");

// update profile
exports.updateProfile = async ({
  reqBody = {},
  reqUser = {},
  files = undefined,
}) => {
  try {
    const image = files?.image;

    if (
      image &&
      !checkFileType({ checkType: FileTypes?.Image, mimeType: image?.mimetype })
    ) {
      throw new ApplicationError(
        `Only image file uploads are allowed for profile picture`
      );
    }

    const UserCollection = User?.collection(reqUser?.orgDb);

    const payload = {
      name: reqBody?.name || reqUser?.name,
      email: reqBody?.email || reqUser?.email,
      mobile: reqBody?.mobile || reqUser?.mobile,
      mobileCountryCode:
        reqBody?.mobileCountryCode || reqUser?.mobileCountryCode,
      safeletNetwork: _defaultTo(
        reqBody?.safeletNetwork,
        reqUser?.safeletNetwork || false
      ),
      termsAccepted: _defaultTo(
        reqBody?.termsAccepted,
        reqUser?.termsAccepted || false
      ),
      location: {
        raw: reqBody?.location || reqUser?.location?.raw,
        latitude:
          reqBody?.location?.split(",")?.[0] || reqUser?.location?.latitude,
        longitude:
          reqBody?.location?.split(",")?.[1] || reqUser?.location?.longitude,
        address: reqBody?.locationAddress || reqUser?.location?.address,
      },
    };

    payload.phoneNumber =
      payload?.mobileCountryCode + payload?.mobile || reqUser?.phoneNumber;

    if (payload?.email !== reqUser?.email) {
      /**
       * Check if email already exist or not
       */
      const emailInUse = await MasterUser?.collection?.countDocuments({
        email,
      });

      if (emailInUse) {
        throw new ApplicationError(`This Email is already in use`);
      }
    }

    if (image) {
      payload.profileImage = await uploadFile({
        file: image,
        type: UploadFileTypes?.UserProfilePic,
      });
    }

    // update user profile
    await UserCollection?.updateOne(
      { userId: reqUser?.userId },
      { $set: payload }
    );

    /**
     * Map invited guardian requests to this user
     */
    const GuardianCollection = Guardian?.collection(reqUser?.orgDb);
    await GuardianCollection?.updateMany(
      { "requestTo.phoneNumber": payload?.phoneNumber, "requestTo.userId": "" },
      { $set: { "requestTo.userId": reqUser?.userId } }
    );

    if (payload?.email !== reqUser?.email) {
      // update master user table
      await MasterUser?.collection?.updateOne(
        { userId: reqUser?.userId },
        { $set: { email: payload?.email } }
      );
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// update fcm-token
exports.updateFcmToken = async ({ reqBody = {}, reqUser = {} }) => {
  try {
    const { fcmToken } = reqBody;
    const UserCollection = User?.collection(reqUser?.orgDb);

    // update user profile
    await UserCollection?.updateOne(
      { userId: reqUser?.userId },
      { $set: { fcmToken } }
    );

    return true;
  } catch (error) {
    throw error;
  }
};

// update password
exports.updatePassword = async ({ reqBody = {}, reqUser = {} }) => {
  try {
    const { currentPassword, newPassword } = reqBody;

    const UserCollection = User?.collection(reqUser?.orgDb);

    // check if current password is correct or not
    if (
      !comparePasswordSync({
        hashedText: reqUser?.password,
        plainText: currentPassword,
      })
    ) {
      throw new ApplicationError(`Current password is wrong`);
    }

    const payload = {
      password: hashPassword(newPassword),
    };

    // update user password
    await UserCollection?.updateOne(
      { userId: reqUser?.userId },
      { $set: payload }
    );

    return true;
  } catch (error) {
    throw error;
  }
};

// delete account
exports.deleteAccount = async ({ reqBody = {}, reqUser = {} }) => {
  try {
    const UserCollection = User?.collection(reqUser?.orgDb);

    // delete user record
    await UserCollection?.deleteOne({ userId: reqUser?.userId });

    // delete user record from Master collection
    await MasterUser?.collection?.deleteOne({ userId: reqUser?.userId });

    return true;
  } catch (error) {
    throw error;
  }
};

// sync user contacts
exports.syncUserContacts = async ({ reqBody = {}, reqUser = {} }) => {
  try {
    const UserCollection = User?.collection(reqUser?.orgDb);
    const GuardianCollection = Guardian?.collection(reqUser?.orgDb);

    const { myContacts } = reqBody;

    const mappedList = [];

    const safeletMembers = await UserCollection?.find(
      { phoneNumber: { $in: myContacts } },
      {
        projection: {
          _id: 0,
          userId: 1,
          mobile: 1,
          mobileCountryCode: 1,
          phoneNumber: 1,
          name: 1,
          profileImage: 1,
        },
      }
    )?.toArray();
    const safeletMemberPhones = _map(safeletMembers, "phoneNumber");

    const userGuardianMembers = await GuardianCollection?.find(
      {
        "requestFrom.phoneNumber": reqUser?.phoneNumber,
        "requestTo.phoneNumber": { $in: myContacts },
      },
      {
        projection: {
          _id: 0,
          fromPhone: "$requestFrom.phoneNumber",
          toPhone: "$requestTo.phoneNumber",
          requestStatus: 1,
        },
      }
    )?.toArray();
    const userGuardianMemberPhones = _map(userGuardianMembers, "toPhone");

    myContacts?.forEach((elRec) => {
      const temp = {
        contact: elRec,
        memberStatus: _includes(safeletMemberPhones, elRec),
        guardianStatus: _includes(userGuardianMemberPhones, elRec)
          ? _find(userGuardianMembers, {
              fromPhone: reqUser?.phoneNumber,
              toPhone: elRec,
            })?.requestStatus
          : null,
        registeredInfo: {
          name: "",
          profileImage: "",
        },
      };
      if (temp?.memberStatus) {
        const safeletUserRec = _find(safeletMembers, { phoneNumber: elRec });
        if (safeletUserRec) {
          temp.registeredInfo.name = safeletUserRec?.name;
          temp.registeredInfo.profileImage = safeletUserRec?.profileImage
            ? getFileLink({ fileName: safeletUserRec?.profileImage })
            : "";
        }
      }
      mappedList?.push(temp);
    });

    return mappedList;
  } catch (error) {
    throw error;
  }
};

// location check-in
exports.locationCheckIn = async ({ reqBody = {}, reqUser = {} }) => {
  try {
    const GuardianCollection = Guardian?.collection(reqUser?.orgDb);
    const CheckInCollection = CheckIn?.collection(reqUser?.orgDb);

    const { location, address, description, guardians = [] } = reqBody;

    const payload = CheckIn?.defaultPayload();
    // set user-id
    payload.userId = reqUser?.userId;
    // set location
    payload.location.raw = location;
    payload.location.latitude = location?.split(",")?.[0];
    payload.location.longitude = location?.split(",")?.[1];
    // set address
    payload.address = address;
    // set description
    payload.description = description || payload?.description;

    await CheckInCollection?.insertOne(payload);

    const whereCondition = {
      "requestFrom.userId": reqUser?.userId,
      requestStatus: GuardianRequestStatus?.Approved,
    };
    if (guardians?.length > 0) {
      whereCondition.guardianId = { $in: guardians };
    }
    const guardianUsers = await GuardianCollection?.find(whereCondition, {
      projection: { _id: 0, toUser: "$requestTo.userId" },
    })?.toArray();
    const guardianUserIds = _map(guardianUsers, "toUser");

    // release notifications to the selected/all guardians
    await notifyFcm({
      orgDb: reqUser?.orgDb,
      title: `${reqUser?.name} checked into ${payload?.address}`,
      body: `${payload?.description}`,
      type: NotificationTypes?.LocationCheckIn,
      userIds: guardianUserIds,
      data: {
        latitude: payload.location.latitude,
        longitude: payload.location.longitude,
      },
    });

    return true;
  } catch (error) {
    throw error;
  }
};

// last location check-in
exports.lastLocationCheckIn = async ({ userId = undefined, reqUser = {} }) => {
  try {
    let message = `Failure`;
    const UserCollection = User?.collection(reqUser?.orgDb);
    const CheckInCollection = CheckIn?.collection(reqUser?.orgDb);
    const lastCheckInRecord = await CheckInCollection?.findOne({ userId });
    let userRecord;
    if (lastCheckInRecord?.userId?.length > 0) {
      userRecord = await UserCollection?.findOne({
        userId: lastCheckInRecord?.userId,
      });
    }
    return {
      success: lastCheckInRecord?.userId?.length > 0,
      message:
        lastCheckInRecord?.userId?.length > 0
          ? `Last check-in details`
          : `No last check-in available`,
      data: {
        ...lastCheckInRecord,
        userName: userRecord?.name,
        profileImage: userRecord?.profileImage
          ? getFileLink({ fileName: userRecord?.profileImage })
          : "",
      },
    };
  } catch (error) {
    throw error;
  }
};

// details location check-in
exports.locationCheckInDetails = async ({ checkInId = undefined, reqUser = {} }) => {
  try {
    let message = `Failure`;
    const UserCollection = User?.collection(reqUser?.orgDb);
    const CheckInCollection = CheckIn?.collection(reqUser?.orgDb);
    const lastCheckInRecord = await CheckInCollection?.findOne({ checkInId });
    let userRecord;
    if (lastCheckInRecord?.userId?.length > 0) {
      userRecord = await UserCollection?.findOne({
        userId: lastCheckInRecord?.userId,
      });
    }
    return {
      success: lastCheckInRecord?.userId?.length > 0,
      message:
        lastCheckInRecord?.userId?.length > 0
          ? `Location check-in details`
          : `No location check-in available`,
      data: {
        ...lastCheckInRecord,
        userName: userRecord?.name,
        profileImage: userRecord?.profileImage
          ? getFileLink({ fileName: userRecord?.profileImage })
          : "",
      },
    };
  } catch (error) {
    throw error;
  }
};

// location follow-me
exports.locationFollowMe = async ({ reqBody = {}, reqUser = {} }) => {
  try {
    const FollowMeCollection = FollowMe?.collection(reqUser?.orgDb);

    const { followMeId, location, address, guardianUserIds = [] } = reqBody;

    if (!followMeId) {
      const activeFollowMe = await FollowMeCollection?.countDocuments({
        status: 1,
        userId: reqUser?.userId,
      });
      if (activeFollowMe > 0) {
        throw new ApplicationError(
          `Only one active Follow me is allowed at a time`
        );
      }

      const payload = FollowMe?.defaultPayload();
      // set user-id
      payload.userId = reqUser?.userId;
      // set location
      payload.location.raw = location;
      payload.location.latitude = location?.split(",")?.[0];
      payload.location.longitude = location?.split(",")?.[1];
      // set address
      payload.address = address;
      // set guardian user Ids
      payload.guardianUserIds = guardianUserIds;

      console.log("guardianUserIds", guardianUserIds);

      await FollowMeCollection?.insertOne(payload);

      // release notifications to the selected guardians
      await notifyFcm({
        orgDb: reqUser?.orgDb,
        title: `${reqUser?.name} asked you to follow them to ${payload?.address}`,
        body: `${payload?.address}`,
        type: NotificationTypes?.FollowMe,
        userIds: guardianUserIds,
        data: {
          followMeId: payload?.followMeId,
        },
      });
      return payload?.followMeId;
    } else {
      await FollowMeCollection?.updateOne(
        { followMeId, status: 1, userId: reqUser?.userId },
        {
          $set: {
            "location.raw": location,
            "location.latitude": location?.split(",")?.[0],
            "location.longitude": location?.split(",")?.[1],
          },
        }
      );
      return followMeId;
    }
  } catch (error) {
    throw error;
  }
};

// location follow-me --get guardians
exports.locationFollowMeGetGuardians = async ({
  followMeId = undefined,
  reqUser = {},
}) => {
  try {
    const FollowMeCollection = FollowMe?.collection(reqUser?.orgDb);
    const UserCollection = User?.collection(reqUser?.orgDb);

    const followMeRecord = await FollowMeCollection?.findOne({
      followMeId,
      status: 1,
      userId: reqUser?.userId,
    });

    if (!followMeRecord) {
      throw new ApplicationError(
        `No such follow request found. Please initiate another one`
      );
    }

    const userDetails = await UserCollection?.find(
      { userId: { $in: followMeRecord?.guardianUserIds } },
      {
        projection: {
          _id: 0,
          userId: 1,
          name: 1,
          phoneNumber: 1,
          profileImage: 1,
        },
      }
    )?.toArray();

    return _map(userDetails, (elUser) => {
      return {
        ...elUser,
        profileImage: elUser?.profileImage
          ? getFileLink({ fileName: elUser?.profileImage })
          : "",
      };
    });
  } catch (error) {
    throw error;
  }
};

// location follow-me --stop by user
exports.followMeStop = async ({ followMeId = undefined, reqUser = {} }) => {
  try {
    const FollowMeCollection = FollowMe?.collection(reqUser?.orgDb);

    const followMeRecord = await FollowMeCollection?.findOne({
      followMeId,
      status: 1,
      userId: reqUser?.userId,
    });

    if (!followMeRecord) {
      throw new ApplicationError(
        `No such follow request found. Please initiate another one`
      );
    }

    await FollowMeCollection?.updateOne(
      { followMeId, status: 1, userId: reqUser?.userId },
      { $set: { status: 0 } }
    );

    // release push notification to the guardians that reached safely
    await notifyFcm({
      orgDb: reqUser?.orgDb,
      title: `${reqUser?.name} has reached safely to ${followMeRecord?.address}`,
      body: `${followMeRecord?.address}`,
      type: NotificationTypes?.FollowMeStop,
      userIds: followMeRecord?.guardianUserIds,
      data: {
        followMeId: followMeRecord?.followMeId,
      },
    });

    return true;
  } catch (error) {
    throw error;
  }
};

// location follow-user
exports.followUser = async ({ followMeId = undefined, reqUser = {} }) => {
  try {
    const FollowMeCollection = FollowMe?.collection(reqUser?.orgDb);

    const followMeRecord = await FollowMeCollection?.findOne(
      { followMeId, status: 1, guardianUserIds: { $in: [reqUser?.userId] } },
      { projection: { _id: 0, location: 1, address: 1 } }
    );

    if (!followMeRecord) {
      throw new ApplicationError(`No such follow request found.`);
    }

    return followMeRecord;
  } catch (error) {
    throw error;
  }
};

// location follow-user --stop by guardian
exports.followUserStop = async ({ followMeId = undefined, reqUser = {} }) => {
  try {
    const FollowMeCollection = FollowMe?.collection(reqUser?.orgDb);

    const followMeRecord = await FollowMeCollection?.findOne({
      followMeId,
      status: 1,
      guardianUserIds: { $in: [reqUser?.userId] },
    });

    if (!followMeRecord) {
      throw new ApplicationError(`No such follow request found.`);
    }

    await FollowMeCollection?.updateOne(
      { followMeId, status: 1, guardianUserIds: { $in: [reqUser?.userId] } },
      {
        $set: {
          guardianUserIds: _without(
            followMeRecord?.guardianUserIds,
            reqUser?.userId
          ),
        },
      }
    );

    // release push notification to the guardians that reached safely
    await notifyFcm({
      orgDb: reqUser?.orgDb,
      title: `${reqUser?.name} has stopped following you to ${followMeRecord?.address}`,
      body: `${followMeRecord?.address}`,
      type: NotificationTypes?.FollowMeStop,
      userIds: [followMeRecord?.userId],
      data: {
        followMeId: followMeRecord?.followMeId,
      },
    });

    return true;
  } catch (error) {
    throw error;
  }
};

// sos-alarm by-user
exports.sosUserAlarm = async ({ reqBody = {}, reqUser = {}, files = {} }) => {
  try {
    const AlarmCollection = Alarms?.collection(reqUser?.orgDb);

    const { alarmId, location, address } = reqBody;

    const recordingChunk = files?.recordingChunk;

    if (!alarmId) {
      const activeAlarms = await AlarmCollection?.countDocuments({
        isPublished: true,
        isActive: true,
        userId: reqUser?.userId,
      });
      if (activeAlarms > 0) {
        throw new ApplicationError(
          `Only one active SOS alarm is allowed at a time`
        );
      }
      const payload = Alarms?.defaultPayload();
      // set user-id
      payload.userId = reqUser?.userId;
      // set location
      payload.location.raw = location;
      payload.location.latitude =
        location?.length > 0 ? location?.split(",")?.[0] || 0 : 0;
      payload.location.longitude =
        location?.length > 0 ? location?.split(",")?.[1] || 0 : 0;
      // set address
      payload.address = address;

      await AlarmCollection?.insertOne(payload);

      // release notifications to the selected guardians
      const GuardianCollection = Guardian?.collection(reqUser?.orgDb);
      const whereCondition = {
        "requestFrom.userId": reqUser?.userId,
        requestStatus: GuardianRequestStatus?.Approved,
      };
      const guardianUsers = await GuardianCollection?.find(whereCondition, {
        projection: { _id: 0, toUser: "$requestTo.userId" },
      })?.toArray();
      const guardianUserIds = _map(guardianUsers, "toUser");

      await notifyFcm({
        orgDb: reqUser?.orgDb,
        title: `${reqUser?.name} raised an S.O.S. alarm`,
        body: `S.O.S. Alarm raised`,
        type: NotificationTypes?.SosAlarm,
        userIds: guardianUserIds,
        data: {
          alarmId: payload?.alarmId,
        },
      });
      return payload?.alarmId;
    } else {
      if (
        !recordingChunk ||
        !checkFileType({
          checkType: FileTypes?.Audio,
          mimeType: recordingChunk?.mimetype,
        })
      ) {
        throw new ApplicationError(`Only audio file uploads are allowed`);
      }

      const fileUpload = await uploadFile({
        file: recordingChunk,
        type: UploadFileTypes?.UserSosRecording,
      });
      await AlarmCollection?.updateOne(
        { alarmId, isActive: true, userId: reqUser?.userId },
        {
          $push: {
            chunkFiles: { $each: [fileUpload], $position: 0 },
          },
          $set: {
            "location.raw": location,
            "location.latitude": location?.split(",")?.[0],
            "location.longitude": location?.split(",")?.[1],
            address,
            lastModified: now(),
          },
        }
      );
      return alarmId;
    }
  } catch (error) {
    throw error;
  }
};

// sos-alarm get latest active alarm
exports.sosLastActiveAlarm = async ({ reqUser = {} }) => {
  try {
    const AlarmsCollection = Alarms?.collection(reqUser?.orgDb);

    const sosAlarmRec = await AlarmsCollection?.findOne({
      isActive: true,
      userId: reqUser?.userId,
    });
    return {
      available: sosAlarmRec?.alarmId?.length > 0,
      alarmId: sosAlarmRec?.alarmId || "",
    };
  } catch (error) {
    throw error;
  }
};

// sos alarm --stop by user
exports.sosAlarmUserStop = async ({
  alarmId = undefined,
  reqUser = {},
  reqBody = {},
}) => {
  try {
    const AlarmsCollection = Alarms?.collection(reqUser?.orgDb);

    const sosAlarmRec = await AlarmsCollection?.findOne({
      alarmId,
      isActive: true,
      userId: reqUser?.userId,
    });

    if (!sosAlarmRec) {
      throw new ApplicationError(
        `No such sos alarm found. Please initiate another one`
      );
    }

    let { reasonTitle, reasonDescription, reasonId } = reqBody;

    if (_map(_values(SosAlarmStopReasons), "id")?.includes(reasonId)) {
      reasonTitle =
        reasonTitle ||
        _find(_values(SosAlarmStopReasons), { id: reasonId })?.value;
      reasonDescription = reasonDescription || reasonTitle;
    } else {
      reasonId = "others";
      reasonTitle = reasonTitle || "Others";
      reasonDescription = reasonDescription || reasonTitle;
    }

    await AlarmsCollection?.updateOne(
      { alarmId, isActive: true, userId: reqUser?.userId },
      { $set: { isActive: false, reasonTitle, reasonDescription, reasonId } }
    );

    // release push notification to the guardians on sos stop alarm
    await notifyFcm({
      orgDb: reqUser?.orgDb,
      title: `${reqUser?.name} stopped the S.O.S. alarm`,
      body: `Reason: ${reasonTitle} (${reasonDescription})`,
      type: NotificationTypes?.SosAlarmStop,
      userIds: sosAlarmRec?.guardianUserIds,
      data: {
        alarmId: sosAlarmRec?.alarmId,
      },
    });

    return true;
  } catch (error) {
    throw error;
  }
};

// sos alarm --stop by guardian
exports.sosAlarmStopByGuardian = async ({
  alarmId = undefined,
  reqUser = {},
}) => {
  try {
    const AlarmsCollection = Alarms?.collection(reqUser?.orgDb);

    const sosAlarmRec = await AlarmsCollection?.findOne({
      alarmId,
      isActive: true,
      guardianUserIds: { $in: [reqUser?.userId] },
    });

    if (!sosAlarmRec) {
      throw new ApplicationError(
        `No such sos alarm found. Please initiate another one`
      );
    }

    await AlarmsCollection?.updateOne(
      { alarmId, isActive: true, guardianUserIds: { $in: [reqUser?.userId] } },
      {
        $set: {
          guardianUserIds: _without(
            sosAlarmRec?.guardianUserIds,
            reqUser?.userId
          ),
        },
      }
    );

    return true;
  } catch (error) {
    throw error;
  }
};

// sos alarm --by guardian
exports.sosJoinAlarm = async ({ alarmId = undefined, reqUser = {} }) => {
  try {
    const AlarmCollection = Alarms?.collection(reqUser?.orgDb);

    const alarmRecord = await AlarmCollection?.findOne({
      alarmId,
      isActive: true,
    });

    if (!alarmRecord) {
      throw new ApplicationError(`No such sos alarm request found.`);
    }

    if (!alarmRecord?.guardianUserIds?.includes(reqUser?.userId)) {
      await AlarmCollection?.updateOne(
        { alarmId, isActive: true },
        {
          $push: {
            guardianUserIds: { $each: [reqUser?.userId], $position: 0 },
          },
          $set: {
            lastModified: now(),
          },
        }
      );
    }

    alarmRecord.chunkFiles = _map(alarmRecord?.chunkFiles, (elRec) =>
      getFileLink({ fileName: elRec })
    );

    return _pick(alarmRecord, ["alarmId", "location", "address", "chunkFiles"]);
  } catch (error) {
    throw error;
  }
};

// sos watch user --by guardian
exports.sosWatchUser = async ({ alarmId = undefined, reqUser = {} }) => {
  try {
    const AlarmCollection = Alarms?.collection(reqUser?.orgDb);

    const alarmRecord = await AlarmCollection?.findOne(
      { alarmId, isActive: true, guardianUserIds: { $in: [reqUser?.userId] } },
      {
        projection: {
          _id: 0,
          location: 1,
          address: 1,
          alarmId: 1,
          chunkFiles: 1,
          isActive: 1,
          reasonTitle: 1,
          reasonDescription: 1,
          reasonId: 1,
        },
      }
    );

    if (!alarmRecord) {
      throw new ApplicationError(`No such sos alarm request found.`);
    }

    alarmRecord.chunkFiles = _map(alarmRecord?.chunkFiles, (elRec) =>
      getFileLink({ fileName: elRec })
    );

    const UserCollection = User?.collection(reqUser?.orgDb);
    const userRecord = await UserCollection?.findOne({
      userId: alarmRecord?.userId,
    });

    return {
      ...alarmRecord,
      userName: userRecord?.name,
      profileImage: userRecord?.profileImage
        ? getFileLink({ fileName: userRecord?.profileImage })
        : "",
    };
  } catch (error) {
    throw error;
  }
};

// sos alarm watch participants --by user
exports.sosWatchParticipants = async ({
  alarmId = undefined,
  reqUser = {},
}) => {
  try {
    const AlarmCollection = Alarms?.collection(reqUser?.orgDb);

    const alarmRecord = await AlarmCollection?.findOne({
      alarmId,
      isActive: true,
    });

    if (!alarmRecord) {
      throw new ApplicationError(`No such sos alarm request found.`);
    }

    alarmRecord.chunkFiles = _map(alarmRecord?.chunkFiles, (elRec) =>
      getFileLink({ fileName: elRec })
    );

    const UserCollection = User?.collection(reqUser?.orgDb);
    const userRecords = await UserCollection?.find({
      userId: { $in: alarmRecord?.guardianUserIds },
    })?.toArray();

    return _map(userRecords, (elUser) => {
      return {
        userId: elUser?.userId,
        name: elUser?.name,
        profileImage: elUser?.profileImage
          ? getFileLink({ fileName: elUser?.profileImage })
          : "",
        location: elUser?.location,
      };
    });
  } catch (error) {
    throw error;
  }
};

// raise support mail
exports.supportMail = async ({ reqBody = {}, reqUser = {} }) => {
  try {
    const { title, description } = reqBody;
    const SupportCollection = Support?.collection(reqUser?.orgDb);
    await SupportCollection?.insertOne({
      ...Support?.defaultPayload(),
      userId: reqUser?.userId,
      title,
      description,
    });
    /**
     * trigger support mail
     */
  } catch (error) {
    throw error;
  }
};

// get events history
exports.getEventsHistory = async ({ reqUser = {} }) => {
  try {
    const data = {
      alarms: [],
      invites: [],
      checkins: [],
    };
    // get alarms history
    {
      const AlarmsCollection = Alarms?.collection(reqUser?.orgDb);
      const alarmHistory = await AlarmsCollection?.aggregate([
        {
          $match: {
            isPublished: true,
            guardianUserIds: { $in: [reqUser?.userId] },
          },
        },
        {
          $lookup: {
            from: "User",
            localField: "userId",
            foreignField: "userId",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
          },
        },
      ])?.toArray();
      data.alarms = _map(alarmHistory, (elRec) => {
        const temp = _pick(elRec, [
          "alarmId",
          "location",
          "address",
          "chunkFiles",
          "reasonTitle",
          "reasonDescription",
          "reasonId",
          "created",
          "lastModified",
        ]);
        return {
          ...temp,
          chunkFiles: _map(temp?.chunkFiles, (elFile) =>
            getFileLink({ fileName: elFile })
          ),
          title: `${elRec?.user?.name} inititated the SOS Alarm ${moment(
            elRec?.created
          )?.fromNow()}`,
          image: getFileLink({ fileName: elRec?.user?.profileImage }),
        };
      });
    }
    // get invites history
    {
      const invitesHistory = await userGuardiansInvites({
        reqUser,
        requestStatus: [
          GuardianRequestStatus?.Approved,
          GuardianRequestStatus?.Denied,
          GuardianRequestStatus?.Invited,
        ],
      });
      data.invites = _map(invitesHistory, (elRec) => {
        return {
          title: `${elRec?.requestFromUserName} has requested you to be their guardian`,
          action: `You ${
            elRec?.requestStatus == GuardianRequestStatus?.Approved
              ? "accepted"
              : elRec?.requestStatus
          } the invitation`,
          image: elRec?.requestFromUserProfileImage || "",
        };
      });
    }
    // get checkins history
    {
      const myUsersList = await myUsers({ reqUser });
      const CheckInCollection = CheckIn?.collection(reqUser?.orgDb);
      const checkInHistory = await CheckInCollection?.find({
        isPublished: true,
        userId: { $in: _map(myUsersList, "userId") },
      })?.toArray();
      data.checkins = _map(checkInHistory, (elRec) => {
        const userRecord = _find(myUsersList, { userId: elRec?.userId });
        return {
          checkInId: elRec?.checkInId,
          userId: elRec?.userId,
          title: `${userRecord?.requestFromUserName} has checked in ${moment(
            elRec?.created
          )?.fromNow()}`,
          image: userRecord?.requestFromUserProfileImage || "",
          address: elRec?.address,
          location: elRec?.location,
          description: elRec?.description,
        };
      });
    }
    return data;
  } catch (error) {
    throw error;
  }
};
