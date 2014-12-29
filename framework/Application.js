/**
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @license MIT
 */

/**
 * @class Application
 */
module.exports = function(config) {
	var components = {};

	/**
	 * Initialize components.
	 */
	var initComponents = function() {
		var defer = _.Q.defer();

		_.Q.spawn(function*() {
			var files = yield _.io.glob('./*/components/*.js');

			yield _.Q.spawnMap(files, function*(file) {
				var name = _.io.baseName(file, 'Component.js'),
					Component = require('../' + file);

				console.info('Load component:', name);

				this[name.toLowerCase()] = new Component();
				if (_.isFunction(this[name.toLowerCase()].init)) {
					yield this[name.toLowerCase()].init(config);
				}
			}, this);

			defer.resolve();
		}, this)

		return defer.promise;
	}.bind(this);

	/**
	 * Init application.
	 */
	this.init = function() {
		var defer = _.Q.defer();

		_.Q.spawn(function*() {
			yield initComponents();
			defer.resolve();
		})

		return defer.promise;
	}
};