/**
 * Module Dependencies
 */
const router = global.express.Router();
const { devHomeSuccess } = require("./../controllers/dev/devController");

const PATH = "/v1";

router.route(`${PATH}/`).get(devHomeSuccess);

module.exports = router;
