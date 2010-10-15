// Layout handling {{{
resize();

function resize(){
    var wrapper = $('#MainWrapper');
    if (wrapper) wrapper.setAttribute('style', 
        'width: ' + window.innerWidth + 'px; ' +
        'height: ' + window.innerHeight +'px;'
    );
}

window.addEventListener('orientationchange', resize);
window.addEventListener('resize', resize);
document.addEventListener('touchmove', function (event){
    event.preventDefault();
});
// }}}

function log(obj){
    var console = $("#Debug");
    if (console){
        var msg = $element("p", {'html': JSON.stringify(obj)});
        inject(msg, console);
    }
}

function $(str){
    if (str instanceof Node) return str;
    return document.querySelector(str);
}

function $$(str){
    if (str instanceof NodeList || str instanceof Array) return $A(str);
    return $A(document.querySelectorAll(str));
}

function $A(ls){
    if (typeof(ls.item) === "function" && typeof(ls.length) === "number") {
        var out = [], len = ls.length, i = 0;
        for (; i < ls.length; i++) out.push(ls.item(i));
        return out;
    }

    return Array.prototype.slice.call(ls);
}

function $element(name, attr){
    var el = document.createElement(name), value;
    for (var key in attr) if (attr.hasOwnProperty(key)) {
        value = attr[key];
        if (key === 'html') {
            el.innerHTML = value;
        } else {
            el.setAttribute(key, value);
        }
    }

    return el;
}

function sendPost(options){
    var req = new XMLHttpRequest,
        data = options.data || {},
        parameters = [];

    for (var key in data) if (data.hasOwnProperty(key)){
        parameters.push(key + "=" + encodeURIComponent(data[key]));
    }
    parameters = parameters.join("&");

    req.onreadystatechange = callback;
    req.open("POST", options.url, true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Content-length", parameters.length);
    req.setRequestHeader("Connection", "close");
    req.send(parameters);

    function callback(){
        var complete = options.onComplete,
            success = options.onSuccess,
            fail = options.onFail;

        if (req.readyState == 4) {
            if (complete) complete.call(req);

            if (req.status == 200) {
                if (success) success.call(req);
            } else {
                if (fail) fail.call(req);
            }
        }
    }
}

function getOrientation(){
    var o = window.orientation;
    return {
        portrait: (o === 0 || o === 180),
        landscape: (o === 90 || o === -90),
        left: o === -90,
        right: o === 90,
        inverted: o === 180
    };
}

function getPoint(event, element){
    var offset = getClientPosition(element);

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
}

function getClientPosition(element){
    var wrapper = $('#MainWrapper');

    return getPosition(element);

    function getPosition(element){
        var offset = {x: element.offsetLeft, y: element.offsetTop};

        return element === wrapper ? {x: 0, y: 0}
            :  translate(offset, getPosition(element.offsetParent));
    }

    function translate(pointA, pointB){
        return {
            'x': pointA.x + pointB.x,
            'y': pointA.y + pointB.y
        };
    }
}            

function inject(child, parentNode){
    if (parentNode.children.length){
        parentNode.insertBefore(child, parentNode.children[0]);
    } else {
        parentNode.appendChild(child);
    }
}

function UIComponent(element, callback){
    this.element = $(element);
    this.callback = callback;
    this.listen();
    this.update();
}

UIComponent.prototype = {
    update: function (){
        var value = this.getValue();
        return this.callback(value);
    },

    getValue: function (){
        var node = this.element;

        if (node.localName === 'input'){
            return node.getAttribute('value');
        } else if (node.localName === 'select'){
            return node.options[node.selectedIndex].getAttribute('value');
        } else {
            return null;
        }
    },

    listen: function (){
        var o = this;
        this.element.addEventListener('change', function (event){
            o.update();
        }, false);
    }
};

function clone(obj){
    var f = function(){};
    f.prototype = obj;
    return new f;
}

$.globals = {};
$.globals.isTouchDevice = (function (){
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (err){
        return false;
    }
}());
