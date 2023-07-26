const swaggerAutogen = require("swagger-autogen")({openapi: '3.0.0'});

const definitions = require("./definitions/definitions");
const { tags } = require("./tags");

const hosts = {
  Local: "localhost:4000",
  Dev: "dev-safelet.herokuapp.com",
};

const doc = {
  info: {
    version: "1.0.0",
    title: "Safelet API v2022",
    description: "Documentation generated for the v2022 APIs.<br /><br /><strong><em>Postman Collection Link: <a target='_blank' href='https://www.getpostman.com/collections/2351d531f8c55d1d7b3d'>Click Here</a></em></strong>",
  },
  host: hosts?.Dev,
  basePath: "/api-v2022",
  schemes: ["https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags,
  securityDefinitions: {
    adminAuthToken: {
      type: "apiKey",
      in: "header",
      name: "Admin-Authorization",
      description: "Admin Authorization Token",
    },
    userAuthToken: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "Admin Authorization Token",
    },
  },
  security: [
    {
      adminAuthToken: [],
      userAuthToken: [],
    },
  ],
  definitions,
};

const outputFile = "./swagger/swagger-output.json";
const endpointsFiles = ["./routes/router.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log(`Project Documentation build successfully`);
  // require("./../index.js");
});
