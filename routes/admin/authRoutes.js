/**
 * Module Dependencies
 */
const router = global.express.Router();
const { login, forgotPassword } = require("../../controllers/admin/authController");
const { validateRequest } = require("../../middleware/validators");
const { loginSchema, forgotPasswordSchema } = require("../../validators/admin/authValidator");

const PATH = "/v1";

// login admin api
router.route(`${PATH}/login`).post(loginSchema, validateRequest, login);

// admin forgot password api
router.route(`${PATH}/forgot-password`).post(forgotPasswordSchema, validateRequest, forgotPassword);

module.exports = router;
