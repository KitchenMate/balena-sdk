###
Copyright 2016 Resin.io

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
###

Promise = require('bluebird')
logs = require('resin-device-logs')
errors = require('resin-errors')

getLogs = (deps, opts) ->
	configModel = require('./models/config')(deps, opts)
	deviceModel = require('./models/device')(deps, opts)

	exports = {}

	getContext = (uuidOrId) ->
		return Promise.props
			device: deviceModel.get(uuidOrId)
			pubNubKeys: configModel.getPubNubKeys()

	###*
	# @summary Subscribe to device logs
	# @name subscribe
	# @function
	# @public
	# @memberof resin.logs
	#
	# @description
	# The `logs` object yielded by this function emits the following events:
	#
	# - `line`: when a log line is received.
	# - `clear`: when the logs are cleared.
	# - `error`: when an error happens.
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {EventEmitter} - logs
	# @returns {Promise}
	#
	# @todo
	# We should consider making this a readable stream.
	#
	# @example
	# resin.logs.subscribe('7cf02a6').then(function(logs) {
	# 	logs.on('line', function(line) {
	# 		console.log(line);
	# 	});
	# 	logs.on('clear', function() {
	# 		console.clear();
	# 	});
	# });
	#
	# @example
	# resin.logs.subscribe(123).then(function(logs) {
	# 	logs.on('line', function(line) {
	# 		console.log(line);
	# 	});
	# 	logs.on('clear', function() {
	# 		console.clear();
	# 	});
	# });
	#
	# @example
	# resin.logs.subscribe('7cf02a6', function(error, logs) {
	# 	if (error) throw error;
	#
	# 	logs.on('line', function(line) {
	# 		console.log(line);
	# 	});
	# });
	###
	exports.subscribe = (uuidOrId, callback) ->
		getContext(uuidOrId)
		.then ({ pubNubKeys, device }) ->
			return logs.subscribe(pubNubKeys, device)
		.asCallback(callback)

	###*
	# @summary Get device logs history
	# @name history
	# @function
	# @public
	# @memberof resin.logs
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String[]} - history lines
	# @returns {Promise}
	#
	# @example
	# resin.logs.history('7cf02a6').then(function(lines) {
	# 	lines.forEach(function(line) {
	# 		console.log(line);
	# 	});
	# });
	#
	# @example
	# resin.logs.history(123).then(function(lines) {
	# 	lines.forEach(function(line) {
	# 		console.log(line);
	# 	});
	# });
	#
	# @example
	# resin.logs.history('7cf02a6', function(error, lines) {
	# 	if (error) throw error;
	#
	# 	lines.forEach(function(line) {
	# 		console.log(line);
	# 	});
	# });
	###
	exports.history = (uuidOrId, callback) ->
		getContext(uuidOrId)
		.then ({ pubNubKeys, device }) ->
			return logs.history(pubNubKeys, device)
		.asCallback(callback)

	###*
	# @summary Get device logs history after the most recent clear request
	# @name historySinceLastClear
	# @function
	# @public
	# @memberof resin.logs
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @fulfil {String[]} - history lines
	# @returns {Promise}
	#
	# @example
	# resin.logs.historySinceLastClear('7cf02a6').then(function(lines) {
	# 	lines.forEach(function(line) {
	# 		console.log(line);
	# 	});
	# });
	#
	# @example
	# resin.logs.historySinceLastClear(123).then(function(lines) {
	# 	lines.forEach(function(line) {
	# 		console.log(line);
	# 	});
	# });
	#
	# @example
	# resin.logs.historySinceLastClear('7cf02a6', function(error, lines) {
	# 	if (error) throw error;
	#
	# 	lines.forEach(function(line) {
	# 		console.log(line);
	# 	});
	# });
	###
	exports.historySinceLastClear = (uuidOrId, callback) ->
		getContext(uuidOrId)
		.then ({ pubNubKeys, device }) ->
			return logs.historySinceLastClear(pubNubKeys, device)
		.asCallback(callback)

	###*
	# @summary Clear device logs history
	# @name clear
	# @function
	# @public
	# @memberof resin.logs
	#
	# @param {String|Number} uuidOrId - device uuid (string) or id (number)
	# @returns {Promise}
	#
	# @example
	# resin.logs.clear('7cf02a6').then(function() {
	# 	console.log('OK');
	# });
	#
	# @example
	# resin.logs.clear(123).then(function() {
	# 	console.log('OK');
	# });
	###
	exports.clear = (uuidOrId, callback) ->
		getContext(uuidOrId)
		.then ({ pubNubKeys, device }) ->
			return logs.clear(pubNubKeys, device)
		.asCallback(callback)

	return exports

module.exports = getLogs
