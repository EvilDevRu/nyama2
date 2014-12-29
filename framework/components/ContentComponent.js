/**
 * Content component.
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @license MIT
 */

var request = require('request'),
	userAgent = require('random-useragent'),
	cheerio = require('cheerio')
	fs = require('fs');

/**
 * @class ContentComponent
 */
module.exports = function() {
	/**
	 * @type {object}
	 * @private
	 */
	this._config = {};

	/**
	 * @type {number}
	 * @private
	 */
	this._attempts = 16;

	/**
	 * Init conponent.
	 * @param {object} config
	 */
	this.init = function(config) {
		var defer = _.Q.defer();

		if (config && config.components && config.components.content) {
			this._config = config.components.content;
			console.info('Use proxy:', this._config.useProxy || false);
		}

		defer.resolve();

		return defer.promise;
	};

	/**
	 * Return html page via get method.
	 * @param url
	 * @param params
	 * @param isOnlyDom
	 * @returns {promise|*|Q.promise}
	 */
	this.get = function(url, params, isNeedAnswer) {
		var defer = _.Q.defer();

		function loop() {
			params = this.configure(url, params);

			//	Request.
			var req = request(params, function(error, response, body) {
				params.attempts = _.isNumber(params.attempts) ? params.attempts : this._attempts;

				//	Check result.
				if (!error && response && response.statusCode === 200) {
					if (params.regexp && !params.regexp.test(body)) {
					}
					else {
						//	DONE!
						defer.resolve(!isNeedAnswer ? cheerio.load(body) : {
							response: response,
							$: cheerio.load(body),
							body: body
						});
						return;
					}
				}

				//	Try again.
				--params.attempts;
				if (params.attempts <= 0) {
					defer.reject(new Error('Fail load page "' + url + '", can\'t try again :( [' + params.proxy + ']'));
					return;
				}

				if (params.log !== false) {
					console.error('Fail load page "' + url + '" try again (' + params.attempts + ')');
				}

				//	Switch ip of proxy address and useragent.
				params = _.extend(params, {
					proxy: Nyama.app().proxy.getRand(),
					headers: {
						'User-Agent': userAgent.getRandom()
					}
				});

				_.Q.whenDelay(loop, defer, this);
			}.bind(this));

			//	If neew download file.
			if (params.writeStream) {
				req.pipe(params.writeStream);
			}
		}

		_.Q.nextTick(loop.bind(this));

		return defer.promise;
	};

	/**
	 * Download file and save on disk.
	 * @param {string} url
	 * @param {string} fileName
	 * @param {object} params
	 */
	this.download = function(url, fileName, params) {
		var defer = _.Q.defer();

		function loop() {
			//	DOWNLOAD FILE
			var writeStream = fs.createWriteStream(fileName);

			console.info('Download file ' + url + ' to ' + fileName);

			writeStream.on('error', function(error) {
				if (error) {
					//	TODO: unlink
					_.Q.whenDelay(loop, defer, this);
				}
			}.bind(this));

			writeStream.on('close', function(error) {
				if (error) {
					//	TODO: unlink
					_.Q.whenDelay(loop, defer, this);
				}
			}.bind(this));

			this.get(url, _.extend(params || {}, { writeStream: writeStream }))
				.then(function() {
					defer.resolve();
				});
		}

		_.Q.nextTick(loop.bind(this));

		return defer.promise;
	},

	/**
	 * @param config
	 */
	this.configure = function(url, config) {
		return _.extend(
			this._config.useProxy ? { proxy: Nyama.app().proxy.getRand() } : {},
			{
				url: url,
				type: 'GET',
				timeout: 30000,
				followAllRedirects: true,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent': userAgent.getRandom()
				}
			},
			config
		);
	};
};