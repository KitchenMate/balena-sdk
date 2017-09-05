// Generated by CoffeeScript 1.12.5
var cloneDeep, convertExpandToObject, errors, fromPairs, getRev, isArray, isEmpty, isFunction, isNumber, isString, mergeExpandOptions, notImplemented, safeSemver, semver,
  hasProp = {}.hasOwnProperty;

errors = require('resin-errors');

semver = require('semver');

cloneDeep = require('lodash/cloneDeep');

fromPairs = require('lodash/fromPairs');

isArray = require('lodash/isArray');

isEmpty = require('lodash/isEmpty');

isFunction = require('lodash/isFunction');

isNumber = require('lodash/isNumber');

isString = require('lodash/isString');

exports.deviceTypes = require('./device-types');

exports.getImgMakerHelper = require('./img-maker');

exports.notImplemented = notImplemented = function() {
  throw new Error('The method is not implemented.');
};

exports.onlyIf = function(condition) {
  return function(fn) {
    if (condition) {
      return fn;
    } else {
      return notImplemented;
    }
  };
};

exports.isId = isNumber;

exports.LOCKED_STATUS_CODE = 423;

exports.findCallback = function(args) {
  var lastArg;
  lastArg = args[args.length - 1];
  if (isFunction(lastArg)) {
    return lastArg;
  }
  return null;
};

exports.notFoundResponse = {
  code: 'ResinRequestError',
  statusCode: 404
};

exports.treatAsMissingApplication = function(nameOrId) {
  return function(err) {
    var replacementErr;
    replacementErr = new errors.ResinApplicationNotFound(nameOrId);
    replacementErr.stack = err.stack;
    throw replacementErr;
  };
};

exports.treatAsMissingDevice = function(uuidOrId) {
  return function(err) {
    var replacementErr;
    replacementErr = new errors.ResinDeviceNotFound(uuidOrId);
    replacementErr.stack = err.stack;
    throw replacementErr;
  };
};

safeSemver = function(version) {
  return version.replace(/(\.[0-9]+)\.rev/, '$1+rev');
};

exports.osVersionRCompare = function(versionA, versionB) {
  var devA, devB, revA, revB, semverResult;
  versionA = safeSemver(versionA);
  versionB = safeSemver(versionB);
  semverResult = semver.rcompare(versionA, versionB);
  if (semverResult !== 0) {
    return semverResult;
  }
  revA = getRev(versionA);
  revB = getRev(versionB);
  if (revA !== revB) {
    return revB - revA;
  }
  devA = exports.isDevelopmentVersion(versionA);
  devB = exports.isDevelopmentVersion(versionB);
  if (devA !== devB) {
    return devA - devB;
  }
  return versionA.localeCompare(versionB);
};

exports.isDevelopmentVersion = function(version) {
  return /(\.|\+|-)dev/.test(version);
};

exports.isProvisioned = function(device) {
  return !isEmpty(device.supervisor_version) && !isEmpty(device.last_connectivity_event);
};

getRev = function(osVersion) {
  var rev;
  rev = semver.parse(osVersion).build.map(function(metadataPart) {
    var ref;
    return (ref = /rev(\d+)/.exec(metadataPart)) != null ? ref[1] : void 0;
  }).filter(function(x) {
    return x != null;
  })[0];
  if (rev != null) {
    return parseInt(rev, 10);
  } else {
    return 0;
  }
};

exports.mergePineOptions = function(defaults, extras) {
  var option, result, value;
  if (!extras) {
    return defaults;
  }
  result = cloneDeep(defaults);
  for (option in extras) {
    if (!hasProp.call(extras, option)) continue;
    value = extras[option];
    switch (option) {
      case 'select':
      case 'orderby':
      case 'top':
      case 'skip':
        result[option] = value;
        break;
      case 'filter':
        if (defaults.filter) {
          result.filter = {
            $and: [defaults.filter, value]
          };
        } else {
          result.filter = value;
        }
        break;
      case 'expand':
        result.expand = mergeExpandOptions(defaults.expand, value);
        break;
      default:
        throw new Error("Unknown pine option: " + option);
    }
  }
  return result;
};

mergeExpandOptions = function(defaultExpand, extraExpand) {
  var expandKey, expandOptions, extraExpandOptions;
  if (defaultExpand == null) {
    return extraExpand;
  }
  defaultExpand = convertExpandToObject(defaultExpand);
  extraExpand = convertExpandToObject(extraExpand);
  for (expandKey in extraExpand) {
    if (!hasProp.call(extraExpand, expandKey)) continue;
    extraExpandOptions = extraExpand[expandKey];
    expandOptions = defaultExpand[expandKey] || (defaultExpand[expandKey] = {});
    if (extraExpandOptions.$select) {
      expandOptions.$select = extraExpandOptions.$select;
    }
    if (extraExpandOptions.$expand) {
      expandOptions.$expand = mergeExpandOptions(expandOptions.$expand, extraExpandOptions.$expand);
    }
  }
  return defaultExpand;
};

convertExpandToObject = function(expandOption) {
  var expandKey, expandRelationshipOptions, invalidKeys, obj;
  if (expandOption == null) {
    return {};
  } else if (isString(expandOption)) {
    return (
      obj = {},
      obj["" + expandOption] = {},
      obj
    );
  } else if (isArray(expandOption)) {
    return fromPairs(expandOption.map(function(key) {
      return [key, {}];
    }));
  } else {
    for (expandKey in expandOption) {
      if (!hasProp.call(expandOption, expandKey)) continue;
      expandRelationshipOptions = expandOption[expandKey];
      invalidKeys = Object.keys(expandRelationshipOptions).filter(function(key) {
        return key !== '$select' && key !== '$expand';
      });
      if (invalidKeys.length > 0) {
        throw new Error("Unknown pine expand options: " + invalidKeys);
      }
    }
    return cloneDeep(expandOption);
  }
};
