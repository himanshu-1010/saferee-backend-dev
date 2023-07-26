const { asyncHandler } = require("../../libs/asyncHandler");
const { generateResponse } = require("../../libs/response");
const { pick: _pick, map: _map, values: _values } = require("lodash");
const {
  updateProfile,
  updatePassword,
  deleteAccount,
  syncUserContacts,
  locationCheckIn,
  locationFollowMe,
  locationFollowMeGetGuardians,
  followMeStop,
  followUserStop,
  followUser,
  supportMail,
  getEventsHistory,
  sosUserAlarm,
  sosAlarmUserStop,
  sosJoinAlarm,
  sosWatchUser,
  sosAlarmStopByGuardian,
  sosLastActiveAlarm,
  updateFcmToken,
  lastLocationCheckIn,
  sosWatchParticipants,
  locationCheckInDetails,
} = require("../../businessLogic/user/profileLogics");
const { getFileLink } = require("../../services/uploadService");
const { SosAlarmStopReasons } = require("../../config/constants");
const { FollowMe } = require("../../db");
const { createFirebaseAuthToken } = require("../../libs/firebaseAdmin");

/**
 * Get Profile
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Account Get My Profile API Endpoint'
   */
  const user = _pick(req?.user, [
    "name",
    "email",
    "mobile",
    "mobileCountryCode",
    "phoneNumber",
    "profileImage",
    "safeletNetwork",
    "termsAccepted",
  ]);
  user.profileImage = user?.profileImage
    ? getFileLink({ fileName: user?.profileImage })
    : null;
  const lastActiveAlarm = await sosLastActiveAlarm({ reqUser: req?.user });
  const FollowMeCollection = FollowMe?.collection(req?.user?.orgDb);
  const followMeRecord = await FollowMeCollection?.findOne({ status: 1, userId: req?.user?.userId, });
  const followingUserRecord = await FollowMeCollection?.findOne({ status: 1, guardianUserIds: { $in: [req?.user?.userId] }, });
  const followMe = {
    followMeId: followMeRecord?.followMeId || "",
    shared: followMeRecord?.followMeId?.length > 0,
    following: followingUserRecord?.followMeId?.length > 0,
  };
  generateResponse({
    res,
    data: { user, lastActiveAlarm, followMe, },
  });
  next();
});

/**
 * Update Profile
 */
exports.saveProfile = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Account Update My Profile API Endpoint'
   * #swagger.consumes = ['multipart/form-data']
   */
  /*
    #swagger.parameters['image'] = {
      in: 'formData',
      description: 'Profile Picture Upload (Only image type)',
      required: true,
      type: 'file',
    }
    #swagger.parameters['name'] = {
      in: 'formData',
      description: 'Update Name',
      required: true,
      type: 'string',
    }
    #swagger.parameters['email'] = {
      in: 'formData',
      description: 'Update Email',
      required: true,
      type: 'string',
    }
    #swagger.parameters['mobile'] = {
      in: 'formData',
      description: 'Update Mobile',
      required: true,
      type: 'integer',
    }
    #swagger.parameters['mobileCountryCode'] = {
      in: 'formData',
      description: 'Update Mobile Country Code ** (+91)',
      required: true,
      type: 'string',
    }
    #swagger.parameters['location'] = {
      in: 'formData',
      description: 'Location lat-long co-ordinates, -1, -1',
      required: false,
      type: 'string',
    }
    #swagger.parameters['locationAddress'] = {
      in: 'formData',
      description: 'Location text address',
      required: false,
      type: 'string',
    }
   */
  const success = Boolean(
    await updateProfile({
      reqBody: req?.body,
      reqUser: req?.user,
      files: req?.files,
    })
  );
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Update FCM Token
 */
exports.saveFcmToken = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Save FCM Token API Endpoint'
   */
  const success = Boolean(
    await updateFcmToken({
      reqBody: req?.body,
      reqUser: req?.user,
    })
  );
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Update Password
 */
exports.changePassword = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'User Account Update My Password API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Change Password',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/UpdatePassword' }
        }
      }
    }
   */
  const success = Boolean(
    await updatePassword({ reqBody: req?.body, reqUser: req?.user })
  );
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Delete User Account
 */
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'User Account Delete My Account API Endpoint'
   */
  const success = Boolean(
    await deleteAccount({ reqBody: req?.body, reqUser: req?.user })
  );
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Sync contacts
 */
exports.syncPhonebook = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'User Account Sync My Contacts API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Sync Phonebook',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/SyncPhoneBook' }
        }
      }
    }
   */
  const contactsInfo = await syncUserContacts({
    reqBody: req?.body,
    reqUser: req?.user,
  });
  generateResponse({
    res,
    data: { contactsInfo },
  });
  next();
});

/**
 * Location check-in
 */
exports.checkInLocation = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Check-In location API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Location Check-In',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/LocationCheckIn' }
        }
      }
    }
   */
  const success = Boolean(
    await locationCheckIn({ reqBody: req?.body, reqUser: req?.user })
  );
  generateResponse({
    res,
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Last Location check-in
 */
exports.lastCheckInLocation = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Get Last Check-In location API Endpoint'
   */
  const { success, data, message } = await lastLocationCheckIn({ userId: req?.params?.userId, reqUser: req?.user });
  generateResponse({
    res,
    data,
    success: success,
    error: !success,
    message: message ? message : success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Location check-in details
 */
exports.checkInLocationDetails = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Get Location Check-In Details API Endpoint'
   */
  const { success, data, message } = await locationCheckInDetails({ checkInId: req?.params?.checkInId, reqUser: req?.user });
  generateResponse({
    res,
    data,
    success: success,
    error: !success,
    message: message ? message : success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Location follow-me
 */
exports.followMeLocation = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Follow Me location API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Location Follow Me',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/LocationFollowMe' }
        }
      }
    }
   */
  /*
    #swagger.responses[200] = {
      description: 'Follow me location shared',
      schema: { $ref: '#/definitions/FollowSharedSuccessResp' }
    }
  */
  const followMeId = await locationFollowMe({
    reqBody: req?.body,
    reqUser: req?.user,
  });
  const success = followMeId?.length > 0;
  generateResponse({
    res,
    data: { followMeId },
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * Location follow-me --get guardians
 */
exports.followMeGetGuardians = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Follow Me location --Get Guardians API Endpoint'
   */
  /*
    #swagger.responses[200] = {
      description: 'Follow me location shared with Guardians',
      schema: { $ref: '#/definitions/FollowSharedWithSuccessResp' }
    }
  */
  const guardians = await locationFollowMeGetGuardians({
    followMeId: req?.params?.followMeId,
    reqUser: req?.user,
  });
  generateResponse({
    res,
    data: { guardians },
  });
  next();
});

/**
 * Location follow-me --stop by user
 */
exports.stopFollowMe = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Follow Me location --Stop by User API Endpoint'
   */
  await followMeStop({
    followMeId: req?.params?.followMeId,
    reqUser: req?.user,
  });
  generateResponse({
    res,
  });
  next();
});

/**
 * Location follow-user
 */
exports.getFollowUser = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Follow User location --Stop by Guardian API Endpoint'
   */
  /*
    #swagger.responses[200] = {
      description: 'Get follow location of the user',
      schema: { $ref: '#/definitions/FollowGetUserSuccessResp' }
    }
  */
  const data = await followUser({
    followMeId: req?.params?.followMeId,
    reqUser: req?.user,
  });
  generateResponse({
    res,
    data,
  });
  next();
});

/**
 * Location follow-user --stop by guardian
 */
exports.stopFollowUser = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Follow User location --Stop by Guardian API Endpoint'
   */
  await followUserStop({
    followMeId: req?.params?.followMeId,
    reqUser: req?.user,
  });
  generateResponse({
    res,
  });
  next();
});

/**
 * Stop SOS Alarm Reasons List
 */
exports.sosStopAlarmReasons = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Stop Reasons for SOS Alarm by user API Endpoint'
   */
  /*
    #swagger.responses[200] = {
      description: 'SOS Alarm details',
      schema: { $ref: '#/definitions/SosAlarmStopReasonsResp' }
    }
  */
  const stopReasons = _values(SosAlarmStopReasons);
  generateResponse({
    res,
    data: { stopReasons },
  });
  next();
});

/**
 * SOS Alarm --by user
 */
exports.sosAlarmUser = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Start SOS Alarm by user API Endpoint'
   */
  /*
    #swagger.parameters['recordingChunk'] = {
      in: 'formData',
      description: 'Recording Chunk file Upload (Only audio type)',
      required: false,
      type: 'file',
    }
    #swagger.parameters['alarmId'] = {
      in: 'formData',
      description: 'Update Existing inititated alarm SOS',
      required: false,
      type: 'string',
    }
    #swagger.parameters['location'] = {
      in: 'formData',
      description: 'Update Location',
      required: false,
      type: 'string',
    }
    #swagger.parameters['address'] = {
      in: 'formData',
      description: 'Update Address',
      required: false,
      type: 'string',
    }
   */
  /*
    #swagger.responses[200] = {
      description: 'SOS Alarm raised by the user',
      schema: { $ref: '#/definitions/SosAlarmStart' }
    }
  */
  const alarmId = await sosUserAlarm({
    reqUser: req?.user,
    reqBody: req?.body,
    files: req?.files,
  });
  const success = alarmId?.length > 0;
  generateResponse({
    res,
    data: { alarmId },
    success: success,
    error: !success,
    message: success ? `Success` : `Failed. Please try after some time.`,
    code: success ? 200 : 422,
  });
  next();
});

/**
 * SOS Alarm --stop by user
 */
exports.stopSosAlarmUser = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'SOS ALarm --Stop by User API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Stop SOS Alarm',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/SosAlarmStop' }
        }
      }
    }
   */
  await sosAlarmUserStop({ alarmId: req?.params?.alarmId, reqUser: req?.user, reqBody: req?.body });
  generateResponse({
    res,
  });
  next();
});

/**
 * SOS Alarm --join by guardian
 */
exports.joinSosAlarmGuardian = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'SOS ALarm --Join by Guardian API Endpoint'
   */
  /*
    #swagger.responses[200] = {
      description: 'SOS Alarm details',
      schema: { $ref: '#/definitions/SoSDetails' }
    }
  */
  const data = await sosJoinAlarm({ alarmId: req?.params?.alarmId, reqUser: req?.user });
  generateResponse({
    res,
    data,
  });
  next();
});

/**
 * SOS Alarm --stop by guardian
 */
exports.stopSosAlarmGuardian = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'SOS ALarm --Stop by Guardian API Endpoint'
   */
  await sosAlarmStopByGuardian({
    alarmId: req?.params?.alarmId,
    reqUser: req?.user,
  });
  generateResponse({
    res,
  });
  next();
});

/**
 * SOS Alarm --get by guardian
 */
exports.getSosAlarmGuardian = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'SOS ALarm --Watch by Guardian API Endpoint'
   */
  /*
    #swagger.responses[200] = {
      description: 'SOS Alarm details',
      schema: { $ref: '#/definitions/SoSDetails' }
    }
  */
  const data = await sosWatchUser({
    alarmId: req?.params?.alarmId,
    reqUser: req?.user,
  });
  generateResponse({
    res,
    data,
  });
  next();
});

/**
 * SOS Alarm --get participants by user
 */
exports.getSosAlarmParticipants = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'SOS ALarm --View participants by User API Endpoint'
   */
  /*
    #swagger.responses[200] = {
      description: 'SOS Alarm participants details',
      schema: { $ref: '#/definitions/SoSDetails' }
    }
  */
  const data = await sosWatchParticipants({
    alarmId: req?.params?.alarmId,
    reqUser: req?.user,
  });
  generateResponse({
    res,
    data,
  });
  next();
});

/**
 * Raise support mail
 */
exports.supportMail = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Raise support mail API Endpoint'
   */
  /*
    #swagger.requestBody = {
      in: 'body',
      description: 'Raise Support Ticket',
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#/definitions/SupportMail' }
        }
      }
    }
   */
  await supportMail({ reqBody: req?.body, reqUser: req?.user });
  generateResponse({
    res,
  });
  next();
});

/**
 * Get Events History
 */
exports.eventsHistory = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Get History of the events API Endpoint'
   */
  /*
    #swagger.responses[200] = {
      description: 'SOS Alarm details',
      schema: { $ref: '#/definitions/EventHistoryResp' }
    }
  */
  const data = await getEventsHistory({ reqUser: req?.user });
  generateResponse({
    res,
    data,
  });
  next();
});

/**
 * Get Firebase Token
 */
exports.getFirebaseToken = asyncHandler(async (req, res, next) => {
  /**
   * #swagger.tags = ['User/My/Account']
   * #swagger.description = 'Get Firebase token for the user API Endpoint'
   */
  /*
    #swagger.responses[200] = {
      description: 'Firebase Auth Token details',
      schema: { $ref: '#/definitions/UserFirebaseAuthTokenResp' }
    }
  */
  const data = await createFirebaseAuthToken(req?.user?.userId);
  generateResponse({
    res,
    data,
  });
  next();
});


