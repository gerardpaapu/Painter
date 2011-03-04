/*globals $: true, Node: false, NodeList: false*/
var $ = (function () {
    var hasOwn = {}.hasOwnProperty,
        slice = [].slice,
        $;
            
    $ = function (str) {
        if (str instanceof Node) {
            return str;
        }
        return document.querySelector(str);
    };

    $.globals = {};
    
    $.globals.wrapper = $("#MainWrapper");
    $.globals.debug = $("#Debug");

    $.log = function (obj) {
        if ($.globals.debug) {
            var msg = $.element("p", {'html': JSON.stringify(obj)});
            $.inject(msg, $.globals.debug);
        }
    };

    $.all = function (str) {
        if (str instanceof NodeList || str instanceof Array) {
            return $.array(str);
        }

        return $.array(document.querySelectorAll(str));
    };

    $.child = function (node, query) {
        // actually ancestor
        return node.querySelector(query);
    };

    $.children = function (node, query) {
        // actually ancestors
        return $.array(node.querySelectorAll(query)); 
    };

    $.array = function (ls) {
        var out, len, i;

        if (typeof(ls.item) === "function" && typeof(ls.length) === "number") {
            for (out = [], len = ls.length, i = 0; i < len; i++) {
                out.push(ls.item(i));
            }
            return out;
        }

        return slice.call(ls);
    };

    $.lockLayout = function () {
        function resize() {
            var wrapper = $.globals.wrapper,
                orientation = $.globals.orientation;	    
	    
	    window.scrollTo(0, 1);

            if ( wrapper ) {
                wrapper.setAttribute(
                    'style', 
                    ('width: ' + window.innerWidth + 'px; ' +
                     'height: ' + window.innerHeight +'px;')
                );
                
                if (orientation.portrait) {
                    $.removeClass(wrapper, 'landscape');
                    $.addClass(wrapper,    'portrait');
                } else {
                    $.addClass(wrapper,    'landscape');
                    $.removeClass(wrapper, 'portrait');
                }
               
                if (orientation.inverted) {
                    $.addClass(wrapper, 'inverted');
                } else {
                    $.removeClass(wrapper, 'inverted');
                }
               
                if (orientation.left) {
                    $.addClass(wrapper, 'left');
                } else {
                    $.removeClass(wrapper, 'left');
                }
               
                if (orientation.right) {
                    $.addClass(wrapper, 'right');
                } else {
                    $.removeClass(wrapper, 'right');
                }
            }
        }

        resize();

        window.addEventListener('orientationchange', resize);
        window.addEventListener('resize', resize);
        document.addEventListener('touchmove', function (event) {
            event.preventDefault();
        });
    };

    $.element = function (name, attr) {
        var el = document.createElement(name), key, value;

        for (key in attr) {
            if (hasOwn.call(attr, key)) {
                value = attr[key];
                if (key === 'html') {
                    el.innerHTML = value;
                } else {
                    el.setAttribute(key, value);
                }
            }
        }

        return el;
    };

    $.sendPost = function (options) {
        var req = new XMLHttpRequest(),
            data = options.data || {},
            parameters = [],
            key;

        function callback() {
            var complete = options.onComplete,
                success	 = options.onSuccess,
                fail	 = options.onFail;

            if (req.readyState === 4) {
                if (complete) {
                    complete.call(req);
                }

                if (req.status === 200) {
                    if (success) {
                        success.call(req);
                    }
                } else {
                    if (fail) {
                        fail.call(req);
                    }
                }
            }
        }

        for (key in data) {
            if (hasOwn.call(data, key)) {
                parameters.push(key + "=" + encodeURIComponent(data[key]));
            }
        }

        parameters = parameters.join("&");

        req.onreadystatechange = callback;
        req.open("POST", options.url, true);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send(parameters);
    };

    $.getPoint = function (event, element) {
        var offset = $.getClientPosition(element),
            touch;

        if (event.targetTouches) {
            touch = event.targetTouches[0];

            if (!(touch && touch.pageX && touch.pageY)) {
                return false;
            }

            return {
                x: touch.pageX - offset.x,
                y: touch.pageY - offset.y
            };
        } else if (event.clientX && event.clientY) {
            return {
                x: event.clientX - offset.x,
                y: event.clientY - offset.y
            };
        } else {
            return false;
        }
    };

    $.getClientPosition = function (element) {
        function translate(pointA, pointB) {
            return {
                'x': pointA.x + pointB.x,
                'y': pointA.y + pointB.y
            };
        }

        function getPosition(element) {
            var offset = {x: element.offsetLeft, y: element.offsetTop};

            return element === document.body ? {x: 0, y: 0}
                :  translate(offset, getPosition(element.offsetParent));
        }

        return getPosition(element);
    };

    $.inject = function (child, parentNode, at) {
        at = at || 0;
        if ($.array(parentNode.children).indexOf(child) !== -1) {
            parentNode.removeChild(child);
        } 
        if (at < parentNode.children.length) {
            parentNode.insertBefore(child, parentNode.children[at]);
        } else {
            parentNode.appendChild(child);
        }
    };

    $.adopt = function (parent, children) {
        for (var i=0; i<children.length; i++) {
            parent.appendChild(children[i]);
        }
    };

    $.clone = function (obj) {
        var F = function() {};
        F.prototype = obj;
        return new F();
    };

    $.extend = function (destination, source) {
        var key;
        for (key in source) {
            if (hasOwn.call(source, key)) {
                destination[key] = source[key];
            }
        }
    };

    $.globals.isTouchDevice = (function () {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (err) {
            return false;
        }
    }());
   
    function getOrientation() {
        var o = window.orientation;
        return (o != null) && {
            portrait: (o === 0 || o === 180),
            landscape: (o === 90 || o === -90),
            left: o === -90,
            right: o === 90,
            inverted: o === 180
        };
    }

    $.globals.orientation = getOrientation(); 

    window.addEventListener('orientationchange', function (event) {
        $.globals.orientation = getOrientation();
    });

    $.globals.mousedown = false;
    window.addEventListener('mousedown', function () { $.globals.mousedown = true; }, true);
    window.addEventListener('mouseup', function () { $.globals.mousedown = false; }, true);

    $.stopEvent = function (event) {
        try {
            event.preventDefault();
            event.stopPropagation();
        } catch (err) {}

        return false;
    };

    $.alert = function (msg) {
        return function () {
            var ctx = this,
                str = msg.replace(/\{([a-z0-9_]+)\}/ig, function (_, key) {
                    return ctx[key];
                });

            window.alert(str);
        };     
    };

    $.gesture = function (opt) {
        // Handle gestures is a uniform way in touch
        // devices and mouse driven browsers:
        //
        // $.gesture({
        //     element: $("Target"), 
        //     // The element to listen to
        //     // (non-optional)
        //
        //     bind: this 
        //     // The object to bind the handlers to
        //     // (optional)
        //
        //     start: function (event, point) {
        //        // (optional)
        //        // handle the start of the gesture
        //     },
        //     
        //     move: function (event, point) {
        //        // (optional)
        //        // handle movement during the gesture
        //     },
        //
        //     end: function (event, point) {
        //        // (optional)
        //        // handle the end of the gesture 
        //     }
        // })
        var element = opt.element,
            bind = opt.bind || this,
            gesture_active;

        function addListener(type, handler) {
            element.addEventListener(type, function (event) {
                var point = $.getPoint(event, this);
                handler.call(bind, event, point);
            });
        }
        
        if (!element) {
            return;
        }

        if ($.globals.isTouchDevice) {

            if (opt.start) {
                addListener('touchstart', opt.start);
            }

            if (hasOwn.call(opt, 'move')) {
                addListener('touchmove', opt.move);
            }

            if (hasOwn.call(opt, 'end')) {
                addListener('touchend', opt.end);
            }
        } else {
            gesture_active = false;

            element.addEventListener('mousedown', function (_) { gesture_active = true; }, true);

            ['mouseup', 'mouseout', 'blur'].forEach(function (type) {
                element.addEventListener(type, function (_) { gesture_active = false; }, true);
            });
            
            if (opt.start) {
                addListener('mousedown', opt.start);
            } 

            if (opt.move) {
                addListener('mousemove', function (event, point) {
                    if (gesture_active) {
                        opt.move.call(bind, event, point);
                    }
                });
            }

            if (opt.end) {
                addListener('mouseout', opt.end);
                addListener('mouseup', opt.end);
                addListener('blur', opt.end);
            }
        }
    };

    $.addClass = function (element, _class) {
        var classes = (element.getAttribute('class') || '').split(' '),
            exists = classes.indexOf(_class) !== -1;

        if (!exists) {
            classes.push(_class);
            element.setAttribute('class', classes.join(' '));
            return true;
        } else {
            return false;
        }
    };

    $.removeClass = function (element, _class) {
        var classes = (element.getAttribute('class') || '').split(' '),
            index = classes.indexOf(_class);

        if (index !== -1) {
            classes.splice(index, 1);
            element.setAttribute('class', classes.join(' '));
            return true;
        } else {
            return false; 
        }
    };

    $.hasClass = function (element, _class) {
        var classes = element.className.split(' ');
        return classes.indexOf(_class) !== -1;
    };

    $.toggleClass = function (element, _class) {
        return $.removeClass(element, _class) || $.addClass(element, _class);
    };

    $.emptyElement = function (element) {
        var child;
        while ((child = element.firstChild)) {
            element.removeChild(child);
        }
    };

    $.mapObject = function (obj, fn, bind) {
        var out = {}, key;

        for (key in obj) {
            if (hasOwn.call(obj, key)) {
                out[key] = fn.call(bind || obj, obj[key], key, obj); 
            }
        }

        return out;
    };

    return $;
}.call(this));
