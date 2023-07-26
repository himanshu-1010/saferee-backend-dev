/**
 * Module Dependencies
 */
const router = global.express.Router();
const { login, register, forgotPassword } = require("../../controllers/user/authController");
const { validateRequest } = require("../../middleware/validators");
const { loginSchema, registerSchema, forgotPasswordSchema } = require("../../validators/user/authValidator");

const PATH = "/v1"; 

// login user api
router.route(`${PATH}/login`).post(loginSchema, validateRequest, login);

// register user api
router.route(`${PATH}/register`).post(registerSchema, validateRequest, register);

// user forgot password api
router.route(`${PATH}/forgot-password`).post(forgotPasswordSchema, validateRequest, forgotPassword);

module.exports = router;
