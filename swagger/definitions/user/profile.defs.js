exports.UpdatePassword = {
  currentPassword: "Password123@",
  newPassword: "Password1234@",
};

exports.SyncPhoneBook = {
  myContacts: ["1234567890", "0987654321"],
};

exports.LocationCheckIn = {
  location: "-1,-1",
  address: "India",
  description: "checked-in location",
  guardians: [],
};

exports.LocationFollowMe = {
  followMeId: "",
  location: "-1,-1",
  address: "India",
  guardianUserIds: [],
};

exports.LocationFollowMeRespone = {
  SharedSuccess: {
    code: 200,
    success: true,
    error: false,
    data: {
      followMeId: "",
    },
    message: "Success",
  },
  SharedWithSuccess: {
    code: 200,
    success: true,
    error: false,
    data: {
      guardians: [
        {
          name: "Guardian Name",
          phoneNumber: "Guardian Number",
        },
      ],
    },
    message: "Success",
  },
  GetUserSuccess: {
    code: 200,
    success: true,
    error: false,
    data: {
      location: {
        raw: "latitude,longitude",
        latitude: "",
        longitude: "",
      },
      address: "User Location Address",
    },
    message: "Success",
  },
};

exports.SupportMail = {
  title: "Issue title",
  description: "Issue description",
};

exports.SosAlarmStart = {
  code: 200,
  success: true,
  error: false,
  data: {
    alarmId: "Zrz8Gu3ShRnTvrBH3uR18",
  },
  message: "Success",
};

exports.SosAlarmStop = {
  reasonTitle: "Stop Reason Title",
  reasonDescription: "Stop Reason Description",
  reasonId: "stopReasonId",
};

exports.SosAlarmStopReasonsResp = {
  code: 200,
  success: true,
  error: false,
  data: {
    stopReasons: [
      {
        id: "testAlarm",
        value: "Please do not worry, this was just a test alarm.",
      },
      {
        id: "accidentalAlarm",
        value: "Please do not worry, I accidentally activated the alarm.",
      },
      {
        id: "alarmNotNeeded",
        value: "Thanks for being alert. I do not longer need your help.",
      },
    ],
  },
  message: "Success",
};

exports.SoSDetails = {
  code: 200,
  success: true,
  error: false,
  data: {
    alarmId: "8lg7k8elNigTKIyB_6-ES",
    location: {
      raw: "-2,-1",
      latitude: "-2",
      longitude: "-1",
    },
    address: "Gurgaon",
    chunkFiles: [
      "localhost:4000/api-v2022/uploads/local/userSosRecordingFile/04_06_2022/1654325633871_m1F1AlawAFsp.wav",
    ],
  },
  message: "Success",
};

exports.EventHistoryResp = {
  code: 200,
  success: true,
  error: false,
  data: {
    alarms: [
      {
        alarmId: "8lg7k8elNigTKIyB_6-ES",
        location: {
          raw: "-2,-1",
          latitude: "-2",
          longitude: "-1",
        },
        address: "Gurgaon",
        chunkFiles: [
          "localhost:4000/api-v2022/uploads/local/userSosRecordingFile/04_06_2022/1654325633871_m1F1AlawAFsp.wav",
        ],
        title: "Nishu Dalal inititated the SOS Alarm 18 minutes ago",
        image:
          "localhost:4000/api-v2022/uploads/local/userProfilePic/17_05_2022/1652810691022_dummy.png",
      },
    ],
    invites: [
      {
        title: "Nishu Dalal has requested you to be their guardian",
        action: "You accepted the invitation",
        image:
          "localhost:4000/api-v2022/uploads/local/userProfilePic/17_05_2022/1652810691022_dummy.png",
      },
    ],
    checkins: [
      {
        title: "Nishu Dalal has checked in 18 days ago",
        image:
          "localhost:4000/api-v2022/uploads/local/userProfilePic/17_05_2022/1652810691022_dummy.png",
        address: "Gurgaon",
        location: {
          raw: "-1,-1",
          latitude: "-1",
          longitude: "-1",
        },
        description: "checked-in location",
      },
    ],
  },
  message: "Success",
};

exports.UserFirebaseAuthTokenResp = {
  code: 200,
  success: true,
  error: false,
  data: {
    token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTY1NzUyNzE3MSwiZXhwIjoxNjU3NTMwNzcxLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay11cXBrakBkZXYtc2FmZWxldC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6ImZpcmViYXNlLWFkbWluc2RrLXVxcGtqQGRldi1zYWZlbGV0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwidWlkIjoiNEJLQjVTbnJpUGRFaWpEZDVrcTFjIn0.LKPZ-uT7eh4HV8RYWAAV9Jypo216I63zrHfShSvGBVoEzkvQfygdEXDPltOXUTQy5M2UkJ9I2Fd9GV1B_JGC3rZfiujsc3CW0ysmmjAvWK7F-mQ361qZRNh-2m75j0hFkb10ABzqof1cGIp88SioNL9iXm4bGfx_VBOLKoaHgy__Y4l6VTDXsOZgZfcAWTrE7hPLbzUzbKx4mV7Iix4MAXd6ab3fH1_f6B9uQHmv-btTJ6Dlz5DaMmcavb70BrEpa1GEuVv8YDohJlqxS_vifzJ2ovaWeIV12-btb4-ZKCMXGAkRaPKhi0DSpZWNH121GZf_3V2nH7-kfDWIIRlO6Q",
  },
  message: "Success",
};
