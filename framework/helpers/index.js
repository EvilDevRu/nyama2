/**
 * Nyama helpers bootstrap file.
 * @author Dmitriy Yurchenko <evildev@evildev.ru>
 * @license MIT
 */

global._ = require('underscore');
global._.io = require('./io');
global._.number = require('./number');
global._.str = require('./str');
global._.url = require('./url');
global._.Q = _.extend(require('q'), require('./q'));
global._.request = require('./request');