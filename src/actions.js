/*
* Very simple Action API
*/
var actions = {
	_uid: 0
};
/**
* Invokes callbacks for all given actions
*/
function doAction(ident) {
	var ns = 'global';
	if( typeof ident == 'object') {
		ns = ident.ns;
		ident = ident.name;
	} else if( typeof ident == 'string') {
		var index = ident.indexOf(':');
		if(index != -1) {
			ns = ident.slice(0, index);
			ident = ident.slice(index + 1, ident.length);
		}
	}
	log(ns + ':' + ident, arguments);
	if(actions[ns] && actions[ns][ident]) {
		var callbacks = actions[ns][ident];
		var args = Array.prototype.slice.call(arguments).splice(1);
		for(var i = 0; i < callbacks.length; i++) {
			callbacks[i].callback.apply(callbacks[i].thisArg, args);
		}
	}
}

/**
* Registers an action with optional this arg
*/
function addAction(ident, callback, thisArg, priority) {
	function indexOf(haystack, callback) {
		for(var i = 0; i < haystack.length; i++) {
			if(haystack[i].callback == callback && haystack[i].thisArg == thisArg) {
				return i;
			}
		}
		return -1;
	}

	var ns = 'global';
	if( typeof ident == 'object') {
		ns = ident.ns;
		ident = ident.name;
	} else if( typeof ident == 'string') {
		var index = ident.indexOf(':');
		if(index != -1) {
			ns = ident.slice(0, index);
			ident = ident.slice(index + 1, ident.length);
		}
	}
	var args = {
		callback : callback,
		thisArg : thisArg ? thisArg : window,
		priority : priority ? priority : 10,
		id: actions._uid++
	};
	if(actions[ns] && actions[ns][ident]) {
		if(indexOf(actions[ns][ident], callback) == -1) {
			actions[ns][ident].push(args);
			actions[ns][ident].sort(function(a, b) {
				return (a.priority > b.priority) - (a.priority < b.priority);
			})
		} else {
			return actions[ns][ident][indexOf(actions[ns][ident], callback)].id;
		}
	} else {
		if(!actions[ns]) {
			actions[ns] = {};
		}
		actions[ns][ident] = new Array(args);
	}
	return args.id;
}

/**
* Removes an action
*/
function removeAction(ident, callback) {
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

	var ns = 'global';
	if( typeof ident == 'object') {
		ns = ident.ns;
		ident = ident.name;
	} else if( typeof ident == 'string') {
		var index = ident.indexOf(':');
		if(index != -1) {
			ns = ident.slice(0, index);
			ident = ident.slice(index + 1, ident.length);
		}
	}
	if(actions[ns] && actions[ns][ident]) {
		if(callback == undefined) {
			delete actions[ns][ident];
			return;
		}
		var index = indexOf(actions[ns][ident], callback);
		if(index != -1) {
			actions[ns][ident].splice(index, 1);
		}
	}
}