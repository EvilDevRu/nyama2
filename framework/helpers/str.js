/**
 * Nyama helpers string helper file.
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @license MIT
 */

module.exports = {
	/**
	 * @param n
	 * @param width
	 * @param z
	 * @returns {string}
	 */
	pad: function(n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}
};