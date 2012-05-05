/**
 * @license Copyright (C) 2012 Matthias Breuer (matthiasbreuer.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Actions namespace object.
 * @type {object}
 */
var actions = {
	hash: {
		_uid: 0
	}
};

/**
 * Helps gettings the right namespace and name
 * @param {string|object} ident Identifier of the action, can have a namespace e.g. 'namespace:action' as string or an object with 'ns' and 'name' keys.
 */
actions._split = function(ident) {
	var split = {
		ns: 'global',
		name: ident
	}
	if( typeof ident == 'object') {
		split.ns = ident.ns;
		split.name = ident.name;
	} else if( typeof ident == 'string') {
		var index = ident.indexOf(':');
		if(index != -1) {
			split.ns = ident.slice(0, index);
			split.name = ident.slice(index + 1, ident.length);
		}
	}
	return split;
}

/**
* Invokes action
* @param {string|object} ident Identifier of the action, can have a namespace e.g. 'namespace:action' as string or an object with 'ns' and 'name' keys.
*/
actions.doAction = function(ident) {
	ident = actions._split(ident);
	log(ident.ns + ':' + ident.name, arguments);
	if(actions.hash[ident.ns] && actions.hash[ident.ns][ident.name]) {
		var callbacks = actions.hash[ident.ns][ident.name];
		var args = Array.prototype.slice.call(arguments).splice(1);
		for(var i = 0; i < callbacks.length; i++) {
			try {
				callbacks[i].callback.apply(callbacks[i].thisArg, args);
			} catch (e) {
				actions.removeAction(ident, callbacks[i].id)
			}
		}
	}
}

/**
* Registers an action.
* @param {string|object} ident Identifier of the action, can have a namespace e.g. 'namespace:action' as string or an object with 'ns' and 'name' keys.
* @param {function} callback Callback fucntion
* @param {object} thisArg Optional this scope
* @param {number} priority Priority of the callback (default: 10)
* @return {number} ID of the callback
*/
actions.addAction = function(ident, callback, thisArg, priority) {
	function indexOf(haystack, callback) {
		for(var i = 0; i < haystack.length; i++) {
			//if(haystack[i].callback == callback && haystack[i].thisArg == thisArg) {
			if(haystack[i].callback == callback) {
				return i;
			}
		}
		return -1;
	}
	
	ident = actions._split(ident);

	var args = {
		callback : callback,
		thisArg : thisArg ? thisArg : window,
		priority : priority ? priority : 10,
		id: actions.hash._uid++
	};
	if(actions.hash[ident.ns] && actions.hash[ident.ns][ident.name]) {
		if(indexOf(actions.hash[ident.ns][ident.name], callback) == -1) {
			actions.hash[ident.ns][ident.name].push(args);
			actions.hash[ident.ns][ident.name].sort(function(a, b) {
				return (a.priority > b.priority) - (a.priority < b.priority);
			});
		} else {
			return actions.hash[ident.ns][ident.name][indexOf(actions.hash[ident.ns][ident.name], callback)].id;
		}
	} else {
		if(!actions.hash[ident.ns]) {
			actions.hash[ident.ns] = {};
		}
		actions.hash[ident.ns][ident.name] = new Array(args);
	}
	return args.id;
}

/**
* Removes an action callback.
* @param {string|object} ident Identifier of the actions
* @param {function|number} callback Callback function or ID
* @return {boolean} True (success) or false (not found)
*/
actions.removeAction= function(ident, callback) {
	function indexOf(haystack, callback) {
		var func = typeof callback === 'function';
		for(var i = 0; i < haystack.length; i++) {
			if(func) {
				if(haystack[i].callback == callback) {
					return i;
				}
			} else {
				if(haystack[i].id == callback) {
					return i;
				}
			}
		}
		return -1;
	}

	ident = actions._split(ident);
	
	if(actions.hash[ident.ns] && actions.hash[ident.ns][ident.name]) {
		if(callback == undefined) {
			delete actions.hash[ident.ns][ident.name];
			return true;
		}
		var index = indexOf(actions.hash[ident.ns][ident.name], callback);
		if(index != -1) {
			actions.hash[ident.ns][ident.name].splice(index, 1);
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

/**
 * Removes a whole namespace
 * @param {string} ns The namespace identifier
 * @return {boolean} true (success) or false (not found)
 */
actions.removeNamespace = function(ns) {
	if(actions.hash[ns]) {
		delete actions.hash[ns];
		return true;
	}
	return false;
}