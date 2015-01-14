/**
 * Database component.
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @license MIT
 */

var Sequelize = require('sequelize');

/**
 * @class DbComponent
 */
module.exports = function() {
	/**
	 * @private
	 */
	this._sequelize;

	/**
	 * @private
	 */
	this._models = {};

	/**
	 * @type {Sequelize}
	 */
	this.Sequelize = Sequelize;

	/**
	 * Init conponent.
	 * @param {object} config
	 */
	this.init = function(config) {
		var defer = _.Q.defer();

		if (config && config.components && config.components.db) {
			this._config = config.components.db;

			this._sequelize = new Sequelize(
				this._config.database,
				this._config.username,
				this._config.password || '',
				this._config.options
			);

			this._sequelize
				.authenticate()
				.complete(function(error) {
					if (error) {
						defer.reject('Unable to connect to the database: ' + error);
						return;
					}

					_.Q.spawn(function*() {
						var path = config.basePath + 'models/',
							isDir = yield _.io.isDir(path);

						if (!isDir) {
							defer.resolve();
							return;
						}

						var files = yield _.io.readDir(path);

						//	Load models.
						_.Q.spawnMap(files, function*(file) {
							var modelName = _.io.baseName(file, '.js');
							this._models[modelName] = require(path + file);
						}.bind(this));

						defer.resolve();
					}.bind(this));
				}.bind(this));
		}

		return defer.promise;
	};

	/**
	 * Returns model.
	 * @param {string} name
	 */
	this.getModel = function(name) {
		var model = this._models[name];
		return this._sequelize.define(name, model.columns, model.options);
	};
}