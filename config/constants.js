exports.TokenKeys = {
  AccessToken: "authorization",
};

exports.Pagination = {
  RecordsPerPage: 1000,
};

exports.FileTypes = {
  Image: "image",
  Audio: "audio",
};

exports.UploadFileTypes = {
  UserProfilePic: "user-profile-pic",
  UserSosRecording: "user-sos-recording-file",
};

exports.UserTypes = {
  Root: "root",
  Admin: "admin",
  User: "user",
  Guardian: "guardian",
}

exports.GuardianRequestStatus = {
  Invited: "invited",
  Cancelled: "cancelled",
  Denied: "denied",
  Removed: "removed",
  Approved: "approved",
  Request: "request",
};

exports.GuardianRequestActions = {
  Accept: "accept",
  Decline: "decline",
};

exports.SosAlarmStopReasons = {
  TestAlarm: {
    id: `testAlarm`,
    value: `Please do not worry, this was just a test alarm.`
  },
  AccidentalAlarm: {
    id: `accidentalAlarm`,
    value: `Please do not worry, I accidentally activated the alarm.`
  },
  NotNeededAlarm: {
    id: `alarmNotNeeded`,
    value: `Thanks for being alert. I do not longer need your help.`
  },
};

exports.NotificationTypes = {
  LocationCheckIn: `locationCheckIn`,
  FollowMe: `followMe`,
  SosAlarm: `sosAlarm`,
  LocationCheckInStop: `locationCheckInStop`,
  FollowMeStop: `followMeStop`,
  SosAlarmStop: `sosAlarmStop`,
};