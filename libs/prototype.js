const { camelCase } = require("lodash");
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

String.prototype.camelCase = function () {
  return this.length > 0 ? camelCase(this.valueOf()) : "";
};
