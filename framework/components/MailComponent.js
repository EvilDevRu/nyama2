/**
 * Mail component.
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @license MIT
 */

var nodemailer = require('nodemailer');

/**
 * @class MailComponent
 */
module.exports = function() {
	/**
	 * @private
	 */
	this._transporter;

	/**
	 * Init conponent.
	 * @param {object} config
	 */
	this.init = function(config) {
		var defer = _.Q.defer();

		if (config && config.components && config.components.mail) {
			this._config = config.components.mail;

			switch (this._config.transporter) {
				//	TODO: Write gmail transporter
				case 'gmail':
					this._transporter = nodemailer.createTransport(this._config);
					break;

				//	SMTP transporter.
				case 'smtp':
					var transport = require('nodemailer-smtp-transport');
					this._transporter = nodemailer.createTransport(transport(this._config.params));
					break;

				//	Direct transporter.
				default:
					this._transporter = nodemailer.createTransport();
					break;
			}
		}
		else {
			this._transporter = nodemailer.createTransport();
		}

		defer.resolve();

		return defer.promise;
	};

	/**
	 * Send new mail.
	 * @param {object} params
	 */
	this.send = function(params) {
		var defer = _.Q.defer();

		if (_.isArray(params.to)) {
			params.to = params.to.join(', ');
		}

		this._transporter.sendMail(params, function(error, info) {
			if (error) {
				defer.reject(error);
			} else {
				defer.resolve('Message sent: ' + info.response);
			}
		});

		return defer.promise;
	}
}