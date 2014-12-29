/**
 * Nyama helpers number helper file.
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @license MIT
 */

module.exports = {
	/**
	 * Smart round value.
	 * @param {number} value
	 * @returns {number}
	 */
	smartRound: function(value) {
		value = parseInt(value, 10);
		var div = value % 100;
		return value + parseInt(90 - div, 10);
	}
};