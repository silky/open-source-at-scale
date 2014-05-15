(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ascope = require('../')(fn);
ascope.appendTo('#scope');

setInterval(function () {
    ascope.setTime(Date.now() / 1000);
    ascope.draw(fn);
}, 50);

function fn (t) {
    return sin(440) * 0.25 + sin(441) * 0.25 + sin(880) * 0.5;
    function sin (x) { return Math.sin(2 * Math.PI * t * x) }
}

},{"../":2}],2:[function(require,module,exports){
var fs = require('fs');
var html = "<div id=\"scope\">\n  <div id=\"sliders\"></div>\n</div>\n";

var domify = require('domify');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var slideways = require('slideways');

module.exports = Scope;
inherits(Scope, EventEmitter);

function Scope (opts) {
    var self = this;
    if (!(this instanceof Scope)) return new Scope(opts);
    if (!opts) opts = {};
    
    this.element = domify(html)[0];
    this.element.style.width = '100%';
    this.element.style.height = '100%';
    
    this.element.addEventListener('click', function (ev) {
        if (ev.target === self.svg || ev.target === sliders
        || ev.target === self.polyline) {
            self.emit('click', ev);
        }
    });
    
    this.svg = createElement('svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.element.appendChild(this.svg);
    
    var p = this.polyline = createElement('polyline');
    p.setAttribute('stroke', opts.stroke || 'cyan');
    p.setAttribute('stroke-width', opts.strokeWidth || '4px');
    p.setAttribute('fill', 'transparent');
    this.svg.appendChild(this.polyline);
    
    this.duration = opts.duration || 1 / 50;
    this.time = 0;
    this.offset = 0;
    
    var sopts = opts.slider || {
        min: -1, max: 3,
        init: Math.log(50) / Math.log(10)
    };
    this.createSlider(sopts, function (x) {
        self.setDuration(Math.pow(10, -x))
    });
    
    var oopts = opts.offset || {
        min: -10,
        max: 10,
        init: 0
    };
    this.createSlider(oopts, function (x) {
        self.setOffset(x / Math.log(self.duration) / Math.log(10));
    });
}

Scope.prototype.appendTo = function (target) {
    if (typeof target === 'string') target = document.querySelector(target);
    target.appendChild(this.element);
    this._target = target;
    this.resize();
};

Scope.prototype.setDuration = function (d) {
    this.duration = d;
};

Scope.prototype.setTime = function (t) {
    this.time = t;
};

Scope.prototype.setOffset = function (x) {
    this.offset = x * this.duration;
};

Scope.prototype.resize = function () {
    if (!this._target) return;
    var style = window.getComputedStyle(this.svg);
    this.width = parseInt(style.width);
    this.height = parseInt(style.height);
};

Scope.prototype.draw = function (fn) {
    var samples = 500;
    
    var points = [];
    for (var i = 0; i < samples; i++) {
        var t = this.offset + this.time + i / samples * this.duration;
        var res = Math.max(-1, Math.min(1, fn(t)));
        if (isNaN(res)) res = 0;
        var x = this.width * (i / samples);
        var y = (res + 1) / 2 * (this.height - 25 * 2) + 10;
        points.push(x + ',' + y);
    }
    this.polyline.setAttribute('points', points.join(' '));
};

Scope.prototype.createSlider = function (opts, f) {
    if (!opts) opts = {};
    var a = slideways(opts);
    if (f) a.on('value', f);
    a.appendTo(this.element.querySelector('#sliders'));
    return a;
}

function createElement (name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}

},{"domify":3,"events":11,"fs":10,"inherits":4,"slideways":5}],3:[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');
  
  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];
  
  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return [el.removeChild(el.lastChild)];
  }
  
  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  return orphan(el.children);
}

/**
 * Orphan `els` and return an array.
 *
 * @param {NodeList} els
 * @return {Array}
 * @api private
 */

function orphan(els) {
  var ret = [];

  while (els.length) {
    ret.push(els[0].parentNode.removeChild(els[0]));
  }

  return ret;
}

},{}],4:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],5:[function(require,module,exports){
(function (process){
var hyperglue = require('hyperglue');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var html = require('./static/html');
var css = require('./static/css');

module.exports = Slider;
inherits(Slider, EventEmitter);

var insertedCss = false;

function Slider (opts) {
    if (!(this instanceof Slider)) return new Slider(opts);
    EventEmitter.call(this);
    var self = this;
    
    if (!opts) opts = {};
    this.max = opts.max === undefined ? 1 : opts.max;
    this.min = opts.min === undefined ? 0 : opts.min;
    this.snap = opts.snap;
    
    process.nextTick(function () {
        if (opts.init !== undefined) {
            self.set(opts.init);
        }
        else if (opts.min !== undefined) {
            self.set(opts.min);
        }
        else self.set(0);
    });
    
    if (!insertedCss && opts.insertCss !== false) {
        var style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        if (document.head.childNodes.length) {
            document.head.insertBefore(style, document.head.childNodes[0]);
        }
        else {
            document.head.appendChild(style);
        }
        insertedCss = true;
    }
    var root = this.element = hyperglue(html);
    
    var turtle = this.turtle = root.querySelector('.turtle');
    var runner = root.querySelector('.runner');
    
    var down = false;
    
    turtle.addEventListener('mousedown', function (ev) {
        ev.preventDefault();
        turtle.className = 'turtle pressed';
        down = {
            x: ev.clientX - root.offsetLeft - turtle.offsetLeft
        }
    });
    root.addEventListener('mousedown', function (ev) {
        ev.preventDefault();
    });
    window.addEventListener('mouseup', mouseup);
    window.addEventListener('mousemove', onmove);
    
    function onmove (ev) {
        ev.preventDefault();
        if (!down) return;
        var w = self._elementWidth();
        var x = Math.max(0, Math.min(w, ev.clientX - root.offsetLeft - down.x));
        var value = x / w;
        if (isNaN(value)) return;
        self.set(self.interpolate(value));
    }
    
    function mouseup () {
        down = true;
        turtle.className = 'turtle';
    }
}

Slider.prototype.appendTo = function (target) {
    if (typeof target === 'string') {
        target = document.querySelector(target);
    }
    target.appendChild(this.element);
};

Slider.prototype.interpolate = function (value) {
    var v = value * (this.max - this.min) + this.min;
    var res = this.snap
        ? Math.round(v / this.snap) * this.snap
        : v
    ;
    return Math.max(this.min, Math.min(this.max, res));
};

Slider.prototype.set = function (value) {
    value = Math.max(this.min, Math.min(this.max, value));
    var x = (value - this.min) / (this.max - this.min);
    this.turtle.style.left = x * this._elementWidth();
    value = Math.round(value * 1e10) / 1e10;
    this.emit('value', value);
};

Slider.prototype._elementWidth = function () {
    var style = {
        root: window.getComputedStyle(this.element),
        turtle: window.getComputedStyle(this.turtle)
    };
    return num(style.root.width) - num(style.turtle.width)
        - num(style.turtle['border-width'])
    ;
};

function num (s) {
    return Number((/^(\d+)/.exec(s) || [0,0])[1]);
}

}).call(this,require("/home/substack/projects/insert-module-globals/node_modules/process/browser.js"))
},{"./static/css":7,"./static/html":8,"/home/substack/projects/insert-module-globals/node_modules/process/browser.js":9,"events":11,"hyperglue":6,"inherits":4}],6:[function(require,module,exports){
module.exports = function (src, updates) {
    if (!updates) updates = {};
    
    var div = src;
    if (typeof div !== 'object') {
        div = document.createElement('div');
        div.innerHTML = src.replace(/^\s+|\s+$/g, '');
        if (div.childNodes.length === 1
        && div.childNodes[0] && div.childNodes[0].constructor
        && div.childNodes[0].constructor.name !== 'Text') {
            div = div.childNodes[0];
        }
    }
    
    forEach(objectKeys(updates), function (selector) {
        var value = updates[selector];
        var nodes = div.querySelectorAll(selector);
        if (nodes.length === 0) return;
        for (var i = 0; i < nodes.length; i++) {
            bind(nodes[i], value);
        }
    });
    
    return div;
};

function bind(node, value) {
    if (isElement(value)) {
        node.innerHTML = '';
        node.appendChild(value);
    }
    else if (value && typeof value === 'object') {
        forEach(objectKeys(value), function (key) {
            if (key === '_text') {
                setText(node, value[key]);
            }
            else if (key === '_html' && isElement(value[key])) {
                node.innerHTML = '';
                node.appendChild(value[key]);
            }
            else if (key === '_html') {
                node.innerHTML = value[key];
            }
            else node.setAttribute(key, value[key]);
        });
    }
    else setText(node, value);
}

function forEach(xs, f) {
    if (xs.forEach) return xs.forEach(f);
    for (var i = 0; i < xs.length; i++) f(xs[i], i)
}

var objectKeys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

function isElement (e) {
    return e && typeof e === 'object' && e.childNodes
        && typeof e.appendChild === 'function'
    ;
}

function setText (e, s) {
    e.innerHTML = '';
    var txt = document.createTextNode(s);
    e.appendChild(txt);
}

},{}],7:[function(require,module,exports){
module.exports = [
  '.slideways {',
    'position: relative;',
    'left: 0px;',
    'top: 0px;',
    'display: inline-block;',
    'height: 24px;',
    'width: 150px;',
  '}',
  '.slideways .turtle {',
    'position: absolute;',
    'top: 0px;',
    'left: 0px;',
    'bottom: 0px;',
    'width: 8px;',
    'margin-top: 0px;',
    'margin-bottom: 0px;',
    'background-color: white;',
    'border: 2px solid rgb(52,52,52);',
    'border-radius: 4px;',
  '}',
  '.slideways .turtle.pressed {',
    'background-color: rgb(223,223,223);',
  '}',
  '.slideways .runner {',
    'position: absolute;',
    'top: 8px;',
    'left: 4px;',
    'right: 4px;',
    'height: 5px;',
    'background-color: rgb(96,96,96);',
    'border: 2px solid rgb(52,52,52);',
    'border-radius: 3px;',
  '}'
].join('\n')

},{}],8:[function(require,module,exports){
module.exports = [
  '<div class="slideways">',
    '<div class="runner"></div>',
    '<div class="turtle"></div>',
  '</div>'
].join('\n')

},{}],9:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],10:[function(require,module,exports){

},{}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[1])