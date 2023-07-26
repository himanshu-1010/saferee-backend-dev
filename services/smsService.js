const otpGenerator = require("otp-generator");

exports.generateOtp = (length = 4) => {
  try {
    const prodCondition = ["prod"].includes(global.config.config_environment);
    const otp = prodCondition
      ? otpGenerator.generate(length, {
          upperCase: false,
          specialChars: false,
          digits: true,
          alphabets: false,
        })
      : "1234";
    return otp;
  } catch (error) {
    throw error;
  }
};
