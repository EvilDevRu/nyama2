/**
 * Nyama helpers q helper file.
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @license MIT
 */

module.exports = {
	/**
	 * @param keys
	 * @param genFn
	 * @returns {*}
	 */
	spawnMap: function(keys, genFn, context) {
		return _.Q.all(keys.map(_.Q.async(context ? genFn.bind(context) : genFn)));
	},

	/**
	 * @param makeGenerator
	 * @param context
	 */
	spawn: function(makeGenerator, context) {
		_.Q.done(_.Q.async(context ? makeGenerator.bind(context) : makeGenerator)());
	},

	/**
	 * @param fn
	 * @param defer
	 * @param context
	 * @param time
	 */
	whenDelay: function(fn, defer, context, time) {
		_.Q.when(_.Q.delay(time || 500), context ? fn.bind(context) : fn, defer.reject);
	}
}