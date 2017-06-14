var common = {};

common.applyVariable = function (string, variable, value, regexFlags) {
  if (regexFlags == null) {
    regexFlags = 'i';
  }
  return string.replace(new RegExp("(^|\\W)\\$" + variable + "(\\W|$)", regexFlags), function(match) {
    return match.replace("$" + variable, value);
  });
};

module.exports = common;