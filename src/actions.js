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
			callbacks[i].callback.apply(callbacks[i].thisArg, args);
		}
	}
}

/**
* Registers an action.
* @param {string|object} ident Identifier of the action, can have a namespace e.g. 'namespace:action' as string or an object with 'ns' and 'name' keys.
* @param {function} callback Callback fucntion
* @param {object} thisArg Optional this scope
* @param {number} priority Priority of the callback (default 10)
*/
actions.addAction = function(ident, callback, thisArg, priority) {
	function indexOf(haystack, callback) {
		for(var i = 0; i < haystack.length; i++) {
			if(haystack[i].callback == callback && haystack[i].thisArg == thisArg) {
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
			})
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
* @return {number} ID of callback or -1 if not existent
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