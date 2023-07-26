/**
 * swagger docs
 */
const swaggerUi = require("swagger-ui-express");
let swaggerFile;
try {
  swaggerFile = require("../swagger/swagger-output.json");
} catch (error) {
  console.log("err", `Swagger File not found`);
}
let basicAuthUsers;
try {
  basicAuthUsers = require("./../config/basicAuthUsers.json");
} catch (error) {
  console.log("err", `Basic auth users not found`);
  basicAuthUsers = {};
}

const router = global.express.Router();

// Basic Authentication module.
const basicAuth = require("express-basic-auth");
const { validateAuthToken, authenticateUserType } = require("../middleware/authorize");
const { UserTypes } = require("../config/constants");

if(swaggerFile) {
  // start swagger
  router.use(
    "/api-docs",
    basicAuth({ users: basicAuthUsers, challenge: true }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerFile, {
      customSiteTitle: `Saferee Backend API v2023 Documentation`,
      swaggerOptions: {
        displayRequestDuration: true,
        filter: true,
        persistAuthorization: true,
        syntaxHighlight: true,
      },
    })
  );
}

// health-checks
router.get(`/`, (req, res) => {
  res.send(
    `Success - ${config?.application?.name} || ${config?.application?.description}`
  );
});

//#region --public routes
router.use(`/public`, require("./publicRoutes"));
//#endregion

//#region --dev routes
router.use(`/dev`, require("./devRoutes"));
//#endregion

//#region user routes
// --auth routes
router.use(`/user/auth`, require("./user/authRoutes"));
// --myself account routes
router.use(`/user/my/account`, validateAuthToken, authenticateUserType([UserTypes?.User]), require("./user/profileRoutes"));
// --myself guardian routes
router.use(`/user/my/guardian`, validateAuthToken, authenticateUserType([UserTypes?.User]), require("./user/guardianRoutes"));
//#endregion

//#region admin routes
// --auth routes
router.use(`/admin/auth`, require("./admin/authRoutes"));
// --myself account routes
router.use(`/admin/my`, validateAuthToken, authenticateUserType([UserTypes?.Admin]), require("./admin/adminRoutes"));
//#endregion

module.exports = router;
