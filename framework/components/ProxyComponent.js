/**
 * Content component.
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @license MIT
 */

var userAgent = require('random-useragent')

/**
 * @class ContentComponent
 */
module.exports = function() {
	/**
	 * @type {{}}
	 * @private
	 */
	this._config = {};

	/**
	 * @type {Array}
	 * @private
	 */
	this._proxyList = [];

	/**
	 * @type {Array}
	 * @private
	 */
	this._aliveList = [];

	/**
	 * Init conponent.
	 * @param {object} config
	 */
	this.init = function(config) {
		var defer = _.Q.defer();

		if (config && config.components && config.components.proxy) {
			this._config = config.components.proxy;
		}

		_.Q.spawn(function*() {
			this._proxyList = yield this._loadProxyList();
			this._aliveList = yield this._checkProxyList();

			defer.resolve();
		}.bind(this));

		return defer.promise;
	};

	/**
	 * Load prxy list.
	 * @private
	 */
	this._loadProxyList = function() {
		var defer = _.Q.defer();

		if (this._config.proxyList) {
			console.info('Load proxy list');
			_.io.readFile(this._config.proxyList)
				.then(function(data) {
					defer.resolve(data.toString().split("\n"));
				}.bind(this));
		}
		else {
			defer.resolve();
		}

		return defer.promise;
	};

	/**
	 * Check proxy list.
	 * @private
	 */
	this._checkProxyList = function() {
		var defer = _.Q.defer(),
			regexp = /Google/;

		if (!this._proxyList || !this._config.useProxy) {
			defer.resolve([]);
		}
		else {
			console.info('Check proxy list');
			_.Q.spawn(function*() {
				var aliveList = yield _.Q.spawnMap(this._proxyList, function*(ip) {
					var result = yield _.request({
						url: 'http://google.com',
						proxy: 'http://' + ip,
						timeout: 6000
					});

					if (!result.error) {
						if (regexp && !regexp.test(result.body)) {
						}
						else {
							console.info('Check proxy: ', ip, "\t\tis alive");
							return 'http://' + ip;
						}
					}

					return false;
				});

				aliveList = _.uniq(_.compact(aliveList));

				if (!aliveList.length) {
					defer.reject('No alived proxy!!');
				}
				else {
					console.info('Alive proxy:', aliveList.length);
					defer.resolve(aliveList);
				}
			}.bind(this));
		}


		return defer.promise;
	};

	/**
	 * Return random proxy address that is alive.
	 */
	this.getRand = function() {
		return this._aliveList.length ? (this._aliveList[Math.floor(Math.random() * this._aliveList.length)]) : null;
	};
};