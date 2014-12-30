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
			var files = _.union(
				yield _.io.glob(__dirname + '/components/*.js'),					//	Nyama components.
				yield _.io.glob(config.basePath + 'components/*.js')	//	User components.
			);

			yield _.Q.spawnMap(files, function*(file) {
				var name = _.io.baseName(file, 'Component.js'),
					Component = require(file);

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