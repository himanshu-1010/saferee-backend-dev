/**
 * Module Dependencies
 */
const router = global.express.Router();
const { inviteAsGuardian, myGuardians, myGuardiansInvites, actionGuardianInvite, myUsers, removeGuardian } = require("../../controllers/user/guardianController");
const { canInviteGuardian, canBecomeGuardian } = require("../../middleware/actions");
const { validateRequest } = require("../../middleware/validators");
const { inviteGuardianSchema, actionGuardianInviteSchema } = require("../../validators/user/guardianValidator");

const PATH = "/v1";

// my guardians api
router.route(`${PATH}/`).get(myGuardians);

// my users api
router.route(`${PATH}/users`).get(myUsers);

// remove guardian api
router.route(`${PATH}/remove/:guardianId`).put(removeGuardian);

// invite guardian api
router.route(`${PATH}/invite`).post(canInviteGuardian, inviteGuardianSchema, validateRequest, inviteAsGuardian);

// view my invites api
router.route(`${PATH}/invites`).get(myGuardiansInvites);

// accept my guardian invite api
router.route(`${PATH}/invite/:guardianId/:action`).put(canBecomeGuardian, actionGuardianInviteSchema, validateRequest, actionGuardianInvite);

module.exports = router;
