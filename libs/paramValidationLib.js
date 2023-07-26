// check if provided email is in valid format or not
exports.ValidEmail = (email) => {
  let emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegex)) {
    return true;
  } else {
    return false;
  }
};

// Minimum 8 characters which contain only characters,numeric digits, underscore and first character must be a letter
exports.ValidPassword = (password) => {
  const containsNumber = /\d+/;
  const specailChar = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  const variableChar = /[A-z]/;
  if (
    password.length >= 8 &&
    containsNumber.test(password) &&
    specailChar.test(password) &&
    variableChar.test(password)
  ) {
    return true;
  } else {
    return false;
  }
};

// Minimum 10 characters which contain only numeric digits
exports.ValidMobile = (mobile = "") => {
  if (!isNaN(mobile.toString()) && mobile.toString().length == 10) {
    return true;
  } else {
    return false;
  }
};

// Validate aadhar number of 12 digits
exports.ValidAadharNumber = (number) => {
  return !isNaN(number.toString()) && number?.length == 12;
};

// Validate PAN number of 16 digits
exports.ValidPan = (number) => {
  const regexPan = /[A-Z]{5}[0-9]{4}[A-Z]{1}/gm;
  return regexPan?.test(number?.toString()?.toUpperCase());
};
