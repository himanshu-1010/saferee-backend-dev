const { merge } = require("lodash");
let config = require("./config.json");

const envConfig = config[process.env.MODE || "local"];

console.log(
  "MODE",
  process.env.MODE,
  "config env.",
  envConfig.config_environment
);

const defaultConfig = {
  application: {
    name: "Saferee Backend Gateway",
    slug: "api-v2023",
    description: "Saferee Backend Gateway",
    version: "1.0.0",
    port: 4000,
  },
  corsConfig: {
    origin: "*",
    methods: "GET,PUT,POST,DELETE",
    preflightContinue: false,
    credentials: true,
    optionsSuccessStatus: 200,
    exposedHeaders: [
      "authorization",
      "Access-Control-Allow-Origin",
    ],
  },
};

const finalConfig = merge(envConfig, defaultConfig);
global.config = finalConfig;
