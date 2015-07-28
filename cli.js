#! /usr/bin/env node
var utilFile = require('./util-file');
var path = require('path');
var postcss = require('postcss');
var args = process.argv.slice(2);
require('./index')(args[0], args[1]);
