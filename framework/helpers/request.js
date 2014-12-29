/**
 * Nyama helpers request helper file.
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @license MIT
 */

var request = require('request');

module.exports = function(params) {
	var defer = _.Q.defer();

	request(params, function(error, response, body) {
		if (error) {
			defer.resolve({
				error: error
			});
		}
		else {
			defer.resolve({
				response: response,
				body: body
			});
		}
	});

	return defer.promise;
};