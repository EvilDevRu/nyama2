/**
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @license MIT
 */

//	Load modules.
require('./helpers');

/**
 * @class Nyama
 */
global.Nyama = new (function() {
	var App = require('./Application.js'),
		app;

	/**
	 * Create a new application.
	 * @param {object} cfg
	 */
	this.createApplication = function(config) {
		var defer = _.Q.defer();

		app = new App(config || {});
		app.init().then(function() {
			global.Nyama = this;
			defer.resolve(app);
		}.bind(this));

		return defer.promise;
	};

	/**
	 * Return instance of application.
	 * @returns {*}
	 */
	this.app = function() {
		return app;
	};
})();