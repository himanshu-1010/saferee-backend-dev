const { Login, Register, ForgotPassword } = require("./user/auth.defs");
const { UpdatePassword, SyncPhoneBook, LocationCheckIn, LocationFollowMe, LocationFollowMeRespone, SupportMail, SoSDetails, SosAlarmStart, EventHistoryResp, SosAlarmStop, SosAlarmStopReasonsResp, UserFirebaseAuthTokenResp } = require("./user/profile.defs");
const { InviteGuardian } = require("./user/guardian.defs");
const { UpdateAdminProfile } = require("./admin/profile.defs");
const { UpdateGroup, UpdateSubGroup, UpdateUser } = require("./admin/admin.defs");

module.exports = {
  Login,
  Register,
  ForgotPassword,
  UpdatePassword,
  SyncPhoneBook,
  LocationCheckIn,
  LocationFollowMe,
  FollowSharedSuccessResp: LocationFollowMeRespone?.SharedSuccess,
  FollowSharedWithSuccessResp: LocationFollowMeRespone?.SharedWithSuccess,
  FollowGetUserSuccessResp: LocationFollowMeRespone?.GetUserSuccess,
  InviteGuardian,
  UpdateAdminProfile,
  UpdateGroup,
  UpdateSubGroup,
  UpdateUser,
  SupportMail,
  SoSDetails,
  SosAlarmStart,
  EventHistoryResp,
  SosAlarmStop,
  SosAlarmStopReasonsResp,
  UserFirebaseAuthTokenResp,
};
