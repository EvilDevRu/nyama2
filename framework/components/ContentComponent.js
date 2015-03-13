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
	 * @type {number}
	 * @private
	 */
	this._defaultNumThreads = 1;

	/**
	 * @type {number}
	 * @private
	 */
	this._numThreads = 0;

	/**
	 * Init conponent.
	 * @param {object} config
	 */
	this.init = function(config) {
		var defer = _.Q.defer();

		if (config && config.components && config.components.content) {
			this._config = config.components.content;
			this._config.numThreads = this._config.numThreads || this._defaultNumThreads;
			console.info('Use proxy:', this._config.useProxy || false);
		}

		defer.resolve();

		return defer.promise;
	};

	/**
	 * Return html page via get method.
	 * @param url
	 * @param params
	 * @param isNeedAnswer
	 * @returns {promise|*|Q.promise}
	 */
	this.get = function(url, params, isNeedAnswer) {
		var defer = _.Q.defer();

		function loop() {
			params = this.configure(url, params);

			//	Threads.
			if (this._numThreads >= params.numThreads) {
				_.Q.whenDelay(loop, defer, this);
				return;
			}

			++this._numThreads;

			//	Request.
			var req = request(params, function(error, response, body) {
				--this._numThreads;

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
					console.error('Fail load page "' + url + '", can\'t try again :( [' + params.proxy + ']');
					defer.resolve(false);
					return;
				}

				if (params.log !== false) {
					console.warn('Fail load page "' + url + '" try again (' + params.attempts + ')');
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
			this._config,
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