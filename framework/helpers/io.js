/**
 * Nyama helpers io helper file.
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @license MIT
 */

var glob = require('glob'),
	fs = require('fs');

module.exports = {
	/**
	 * @param path
	 * @param options
	 * @returns {promise|*|Q.promise}
	 */
	glob: function(path, options) {
		var defer = _.Q.defer();

		glob(path, options || {}, function (error, files) {
			if (error) {
				defer.reject(error);
			}
			else {
				defer.resolve(files);
			}
		});

		return defer.promise;
	},

	/**
	 * Returns trailing name component of path.
	 * @param {string} path path to a file.
	 * @param {string} suffix if path ends for suffix then erase it.
	 * @return {string}
	 */
	baseName: function(path, suffix) {
		path = path.replace(/^.*[\/\\]/g, '');
		if (_.isString(suffix) && path.substr(path.length - suffix.length) === suffix) {
			path = path.substr(0, path.length - suffix.length);
		}

		return path;
	},

	/**
	 * Read file.
	 * @param {string} fileName
	 * @returns {promise|*|Q.promise}
	 */
	readFile: function(fileName) {
		var defer = _.Q.defer();

		fs.readFile(fileName, function (error, data) {
			if (error) {
				defer.reject(error);
			}
			else {
				defer.resolve(data);
			}
		});

		return defer.promise;
	}
};