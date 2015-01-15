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
	 * @param fileName
	 * @param options
	 * @returns {promise|*|exports.promise|Q.promise}
	 */
	readFile: function(fileName, options) {
		var defer = _.Q.defer();

		fs.readFile(fileName, options || { encoding: 'utf-8' }, function (error, data) {
			if (error) {
				defer.reject(error);
			}
			else {
				defer.resolve(data);
			}
		});

		return defer.promise;
	},

	/**
	 * Read dir.
	 * @param {string} dirName
	 */
	readDir: function(dirName) {
		var defer = _.Q.defer();

		fs.readdir(dirName, function(error, files) {
			if (error) {
				defer.reject(error);
				return;
			}

			defer.resolve(files);
		});

		return defer.promise;
	},

	/**
	 * Tells whether the dirName is a directory.
	 * @param {string} path path to a directory.
	 * @returns {*}
	 */
	isDir: function(path) {
		var defer = _.Q.defer();

		try {
			fs.lstat(path, function(error, stats) {
				if (error) {
					defer.resolve(false);
				}
				else {
					defer.resolve(stats.isDirectory());
				}
			});
		}
		catch (e) {
			defer.resolve(false);
		}

		return defer.promise;
	},

	/**
	 * Check file.
	 * @param path
	 * @returns {promise|*|exports.promise|Q.promise}
	 */
	isFile: function(path) {
		var defer = _.Q.defer();

		fs.exists(path, function(exists) {
			defer.resolve(exists);
		});

		return defer.promise;
	},

	/**
	 * Make directory.
	 * @param {string} path path to a directory.
	 * @param {number} mode directory access mode.
	 * @returns {boolean} returns true if directory is successfully created.
	 */
	mkDir: function(path, mode) {
		var defer = _.Q.defer();

		try {
			fs.mkdir(path, mode, function(error, status) {
				if (error) {
					defer.resolve(false);
				}
				else {
					defer.resolve(status);
				}
			});
		}
		catch (e) {
			defer.resolve(false);
		}

		return defer.promise;
	}
};