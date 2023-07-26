/**
 * Module Dependencies
 */
const router = global.express.Router();
const { apiHomeSuccess } = require("../controllers/public/publicController");

const PATH = "/v1";

// fetch public-home-page
router.route(`${PATH}`).get(apiHomeSuccess);

module.exports = router;
