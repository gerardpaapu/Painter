var $ = (function (){
    var $ = function (str){
        if (str instanceof Node){
            return str;
        }
        return document.querySelector(str);
    };

    $.globals = {};
    
    $.globals.wrapper = $("#MainWrapper");

    $.log = function (obj){
        var console = $("#Debug");
        if (console){
            var msg = $.element("p", {'html': JSON.stringify(obj)});
            $.inject(msg, console);
        }
    };

    $.all = function (str){
        if (str instanceof NodeList || str instanceof Array) {
            return $.array(str);
        }

        return $.array(document.querySelectorAll(str));
    };

    $.child = function (node, query){
        return node.querySelector(query);
    };

    $.children = function (node, query){
        return $.array(node.querySelectorAll(query)); 
    };

    $.array = function (ls){
        if (typeof(ls.item) === "function" && typeof(ls.length) === "number") {
            var out = [], len = ls.length, i = 0;
            for (; i < len; i++){
                out.push(ls.item(i));
            }
            return out;
        }

        return Array.prototype.slice.call(ls);
    };

    $.lockLayout = function (){
        var wrapper = $.globals.wrapper;

        function resize(){
            if (wrapper){
                wrapper.setAttribute(
                    'style', 
                    ('width: ' + window.innerWidth + 'px; ' +
                     'height: ' + window.innerHeight +'px;')
                );
            }
        }

        resize();

        window.addEventListener('orientationchange', resize);
        window.addEventListener('resize', resize);
        document.addEventListener('touchmove', function (event){
            event.preventDefault();
        });
    };

    $.element = function (name, attr){
        var el = document.createElement(name), key, value;

        for (key in attr) {
            if (attr.hasOwnProperty(key)) {
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

    $.sendPost = function (options){
        function callback(){
            var complete = options.onComplete,
            success = options.onSuccess,
            fail = options.onFail;

            if (req.readyState == 4) {
                if (complete) {
                    complete.call(req);
                }

                if (req.status == 200) {
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

        var req = new XMLHttpRequest(),
            data = options.data || {},
            hasOwn = Object.prototype.hasOwnProperty,
            parameters = [];

        for (var key in data){
            if (hasOwn.call(data, key)){
                parameters.push(key + "=" + escape(data[key]));
            }
        }

        parameters = parameters.join("&");

        req.onreadystatechange = callback;
        req.open("POST", options.url, true);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send(parameters);
    };

    $.getPoint = function (event, element){
        var offset = $.getClientPosition(element);

        if (event.targetTouches){
            var touch = event.targetTouches[0];

            return {
                x: touch.pageX - offset.x,
                y: touch.pageY - offset.y
            };
        } else {
            return {
                x: event.clientX - offset.x,
                y: event.clientY - offset.y
            };
        }
    };

    $.getClientPosition = function (element){
        function getPosition(element){
            var offset = {x: element.offsetLeft, y: element.offsetTop};

            return element === document.body ? {x: 0, y: 0}
                :  translate(offset, getPosition(element.offsetParent));
        }

        function translate(pointA, pointB){
            return {
                'x': pointA.x + pointB.x,
                'y': pointA.y + pointB.y
            };
        }

        return getPosition(element);
    };

    $.inject = function (child, parentNode){
        if (parentNode.children.length){
            parentNode.insertBefore(child, parentNode.children[0]);
        } else {
            parentNode.appendChild(child);
        }
    };

    $.adopt = function (parent, children){
        for (var i=0; i<children.length; i++){
            parent.appendChild(children[i]);
        }
    };

    $.clone = function (obj){
        var F = function(){};
        F.prototype = obj;
        return new F();
    };

    $.extend = function (destination, source){
        var hasOwn = Object.prototype.hasOwnProperty, key;
        for (key in source) {
            if (hasOwn.call(source, key)){
                destination[key] = source[key];
            }
        }
    };

    $.globals.isTouchDevice = (function (){
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (err){
            return false;
        }
    }());
   
    function getOrientation(){
        var o = window.orientation;
        return window.orientation && {
            portrait: (o === 0 || o === 180),
            landscape: (o === 90 || o === -90),
            left: o === -90,
            right: o === 90,
            inverted: o === 180
        };
    }

    $.globals.orientation = getOrientation(); 

    window.addEventListener('orientationchange', function (event){
        $.globals.orientation = getOrientation();
    });

    $.globals.mousedown = false;
    window.addEventListener('mousedown', function (){ $.globals.mousedown = true; }, true);
    window.addEventListener('mouseup', function (){ $.globals.mousedown = false; }, true);

    $.stopEvent = function (event){
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    $.alert = function (msg){
        return function (){
            var ctx = this,
                str = msg.replace(/\{([a-z0-9_]+)\}/ig, function (_, key){
                    return ctx[key];
                });
            alert(str);
        };     
    };

    $.gesture = function (opt){
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
        //     start: function (event, point){
        //        // (optional)
        //        // handle the start of the gesture
        //     },
        //     
        //     move: function (event, point){
        //        // (optional)
        //        // handle movement during the gesture
        //     },
        //
        //     end: function (event, point){
        //        // (optional)
        //        // handle the end of the gesture 
        //     }
        // })
        var element = opt.element,
            bind = opt.bind;

        function addListener(type, handler){
            element.addEventListener(type, function (event){
                var point = $.getPoint(event, this);
                handler.call(bind || this, event, point);
            });
        }
        
        if (!element) {
            return false;
        }

        if ($.globals.isTouchDevice){
            if (opt.start){
                addListener('touchstart', opt.start);
            }

            if (opt.move){
                addListener('touchmove', opt.move);
            }

            if (opt.end){
                addListener('touchend', opt.move);
            }
        } else {
            var gesture_active = false;

            element.addEventListener('mousedown', function (_){ gesture_active = true; }, true);

            ['mouseup', 'mouseout', 'blur'].forEach(function (type){
                element.addEventListener(type, function (_){ gesture_active = false; }, true);
            });
            
            if (opt.start) {
                addListener('mousedown', opt.start);
            } 

            if (opt.move){
                addListener('mousemove', function (event, point){
                    if (gesture_active){
                        opt.move.call(this || bind, event, point);
                    }
                });
            }

            if (opt.end){
                addListener('mouseout', opt.end);
                addListener('mouseup', opt.end);
                addListener('blur', opt.end);
            }
        }
    };

    return $;
}.call(this));
