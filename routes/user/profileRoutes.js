/**
 * Module Dependencies
 */
const router = global.express.Router();
const { getProfile, saveProfile, changePassword, deleteAccount, syncPhonebook, checkInLocation, followMeLocation, followMeGetGuardians, stopFollowMe, stopFollowUser, getFollowUser, supportMail, eventsHistory, sosAlarmUser, stopSosAlarmUser, stopSosAlarmGuardian, joinSosAlarmGuardian, getSosAlarmGuardian, sosStopAlarmReasons, saveFcmToken, lastCheckInLocation, getSosAlarmParticipants, checkInLocationDetails, getFirebaseToken } = require("../../controllers/user/profileController");
const { validateRequest } = require("../../middleware/validators");
const { profileSchema, passwordUpdateSchema, phoneBookSchema, locationCheckInSchema, locationFollowMeSchema, raiseSupportSchema, sosAlarmUpdateSchema, fcmTokenSchema } = require("../../validators/user/profileValidator");

const PATH = "/v1";

// get profile api
router.route(`${PATH}/profile`).get(getProfile);

// update profile api
router.route(`${PATH}/profile`).post(profileSchema, validateRequest, saveProfile);

// update fcm-token api
router.route(`${PATH}/fcm-token`).post(fcmTokenSchema, validateRequest, saveFcmToken);

// update password
router.route(`${PATH}/password`).post(passwordUpdateSchema, validateRequest, changePassword);

// delete my account
router.route(`${PATH}/`).delete(deleteAccount);

// sync-contacts
router.route(`${PATH}/sync-contacts`).post(phoneBookSchema, validateRequest, syncPhonebook);

// check-in api
router.route(`${PATH}/check-in`).put(locationCheckInSchema, validateRequest, checkInLocation);

// last-check-in api
router.route(`${PATH}/last-check-in/:userId`).get(lastCheckInLocation);

// get-check-in details by id api
router.route(`${PATH}/check-in/:checkInId`).get(checkInLocationDetails);

// follow-me api
router.route(`${PATH}/follow-me`).put(locationFollowMeSchema, validateRequest, followMeLocation);

// get follow-me guardians api
router.route(`${PATH}/follow-me/guardians/:followMeId`).get(followMeGetGuardians);

// stop follow-me by user
router.route(`${PATH}/follow-me/stop/:followMeId`).get(stopFollowMe);

// get follow-user api
router.route(`${PATH}/follow-user/:followMeId`).get(getFollowUser);

// stop follow-user by guardian
router.route(`${PATH}/follow-user/stop/:followMeId`).get(stopFollowUser);

// sos-rejection-reasons
router.route(`${PATH}/sos-alarm/stop-reasons`).get(sosStopAlarmReasons);

// sos-alarm by user
router.route(`${PATH}/sos-alarm`).put(sosAlarmUpdateSchema, validateRequest, sosAlarmUser);

// stop sos-alarm by user
router.route(`${PATH}/sos-alarm/stop/:alarmId`).post(stopSosAlarmUser);

// stop sos-alarm by guardian
router.route(`${PATH}/sos-user-alarm/stop/:alarmId`).get(stopSosAlarmGuardian);

// join sos-alarm by guardian
router.route(`${PATH}/sos-user-alarm/join/:alarmId`).get(joinSosAlarmGuardian);

// watch sos-alarm by guardian
router.route(`${PATH}/sos-user-alarm/watch/:alarmId`).get(getSosAlarmGuardian);

// watch sos-alarm participants by user
router.route(`${PATH}/sos-user-alarm/participants/:alarmId`).get(getSosAlarmParticipants);

// rasie support mail
router.route(`${PATH}/support`).post(raiseSupportSchema, validateRequest, supportMail);

// get events history
router.route(`${PATH}/events-history`).get(eventsHistory);

// get firebase-tokens
router.route(`${PATH}/firebase-token`).get(getFirebaseToken);

module.exports = router;
