/**
 * Module Dependencies
 */
const router = global.express.Router();
const { getAllGroups, changePassword, updateGroup, deleteGroup, getAllSubGroups, updateSubGroup, deleteSubGroup, getProfile, getUsers, updateUser, getStats, getSupportTickets, getStatsDetails, updateUserActions } = require("../../controllers/admin/adminController");
const { validateRequest } = require("../../middleware/validators");
const { groupSchema, passwordUpdateSchema, subGroupSchema, userUpdateSchema } = require("../../validators/admin/adminValidator");

const PATH = "/v1";

// get profile
router.route(`${PATH}/profile`).get(getProfile);

// update password
router.route(`${PATH}/password`).post(passwordUpdateSchema, validateRequest, changePassword);

//#region groups management

// get group api
router.route(`${PATH}/groups`).get(getAllGroups);

// update groups api
router.route(`${PATH}/groups`).post(groupSchema, validateRequest, updateGroup);

// delete group api
router.route(`${PATH}/groups/:groupId`).delete(deleteGroup);

//#endregion

//#region sub-groups management

// get sub-groups api
router.route(`${PATH}/sub-groups/:groupId?`).get(getAllSubGroups);

// update sub-groups api
router.route(`${PATH}/sub-groups`).post(subGroupSchema, validateRequest, updateSubGroup);

// delete sub-group api
router.route(`${PATH}/sub-groups/:subGroupId`).delete(deleteSubGroup);

//#endregion

//#region user management

// get users api
router.route(`${PATH}/users`).get(getUsers);

// get support list api
router.route(`${PATH}/support-tickets`).get(getSupportTickets);

// update users api
router.route(`${PATH}/users`).post(userUpdateSchema, validateRequest, updateUser);

// update user actions api
router.route(`${PATH}/user-update`).post(updateUserActions);

// get stats api
router.route(`${PATH}/stats`).get(getStats);

// get stats details api
router.route(`${PATH}/stats-details`).get(getStatsDetails);

//#endregion

module.exports = router;
