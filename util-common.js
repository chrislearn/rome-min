/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

'use strict';

// Nodejs libs.
var nodeUtil = require('util');
var path = require('path');

// The module to be exported.
var util = module.exports = {};

// External libs.
var _ = util._ = require('lodash');

// Mixin Underscore.string methods.
//_.str = require('underscore.string');
//_.mixin(_.str.exports());

// Return a function that normalizes the given function either returning a
// value or accepting a "done" callback that accepts a single value.
util.callbackify = function(fn) {
  return function callbackable() {
    // Invoke original function, getting its result.
    var result = fn.apply(this, arguments);
    // If the same number or less arguments were specified than fn accepts,
    // assume the "done" callback was already handled.
    var length = arguments.length;
    if (length === fn.length) { return; }
    // Otherwise, if the last argument is a function, assume it is a "done"
    // callback and call it.
    var done = arguments[length - 1];
    if (typeof done === 'function') { done(result); }
  };
};

// Create a new Error object, with an origError property that will be dumped
// if grunt was run with the --debug=9 option.
util.error = function(err, origError) {
  if (!nodeUtil.isError(err)) { err = new Error(err); }
  if (origError) { err.origError = origError; }
  return err;
};

// The line feed char for the current system.
util.linefeed = process.platform === 'win32' ? '\r\n' : '\n';

// Normalize linefeeds in a string.
util.normalizelf = function(str) {
  return str.replace(/\r\n|\n/g, util.linefeed);
};

// What "kind" is a value?
// I really need to rework https://github.com/cowboy/javascript-getclass
var kindsOf = {};
'Number String Boolean Function RegExp Array Date Error'.split(' ').forEach(function(k) {
  kindsOf['[object ' + k + ']'] = k.toLowerCase();
});
util.kindOf = function(value) {
  // Null or undefined.
  if (value == null) { return String(value); }
  // Everything else.
  return kindsOf[kindsOf.toString.call(value)] || 'object';
};

// Coerce something to an Array.
util.toArray = Function.call.bind(Array.prototype.slice);

// Return the string `str` repeated `n` times.
util.repeat = function(n, str) {
  return new Array(n + 1).join(str || ' ');
};

// Given str of "a/b", If n is 1, return "a" otherwise "b".
util.pluralize = function(n, str, separator) {
  var parts = str.split(separator || '/');
  return n === 1 ? (parts[0] || '') : (parts[1] || '');
};

// Recurse through objects and arrays, executing fn for each non-object.
util.recurse = function recurse(value, fn, fnContinue) {
  var obj;
  if (fnContinue && fnContinue(value) === false) {
    // Skip value if necessary.
    return value;
  } else if (util.kindOf(value) === 'array') {
    // If value is an array, recurse.
    return value.map(function(value) {
      return recurse(value, fn, fnContinue);
    });
  } else if (util.kindOf(value) === 'object') {
    // If value is an object, recurse.
    obj = {};
    Object.keys(value).forEach(function(key) {
      obj[key] = recurse(value[key], fn, fnContinue);
    });
    return obj;
  } else {
    // Otherwise pass value into fn and return.
    return fn(value);
  }
};

util.RegExpQuote = function(str) {
    return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

util.objToXmlAttrs = function(attrs){
  var str = ' ';
  for (var i in attrs){
    str += i + '=' + attrs[i] + ' ';
  }
  return str;
};

util.getRelValue = function(currentValue, newValue){
  if (typeof newValue === 'string'){
    if (/\+=/.test(newValue)){
      newValue = currentValue + parseFloat(newValue.replace('+=', ''));
    }else if (/-=/.test(newValue)){
      newValue = currentValue - parseFloat(newValue.replace('-=', ''));
    }else if (/\*=/.test(newValue)){
      newValue = currentValue * parseFloat(newValue.replace('*=', ''));
    }else if (/\/=/.test(newValue)){
      newValue = currentValue / parseFloat(newValue.replace('/=', ''));
    }
  }
  return newValue;
};