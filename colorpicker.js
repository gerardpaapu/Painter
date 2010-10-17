function ColorPicker = function (options){
    options = options || {};
    this.width = options.width;
    this.height = options.height;
    this.createElements();
    this.setupEvents();
    this.x = this.y = this.z = 0;
};
ColorPicker = {
    'createElements': function (){
        this.container = $.element('div', {'class': colorpicker});
        this.zPicker = $.element('canvas', {width: 20, height: 255});
        this.xyPicker = $.element('canvas', {width: 255, height: 255});
        this.input = $.element('input', {type: "color", value: "#000000"});
        this.sample = $.element('div', {'class': "sample"});
        this.saveButton = $.element('input', {type: "button", value: 'save'});
        this.paletteSwatches = this.palette.map(function (color){
            var item = $.element("li", {'class': "swatch"});
            $.inject(item, list);
            return item;
        });

        var list = $.element('ul', {'class': "palette"});
        var controls = $.element('div', {'class': "controls"});
        var canvasWrapper = $.element('div', {'class': "canvasWrapper"});

        $.adopt(list, this.paletteSwatches);
        $.adopt(controls, [this.input, this.sample, this.saveButton]);
        $.adopt(canvasWrapper, [this.zPicker, this.xyPicker]);
        $.adopt(this.container, [canvasWrapper, controls, list]);

        this.drawXYPicker();
        this.drawZPicker();
    },

    drawZPicker: function (){
        var ctx = this.zPicker.getContext('2d');
        var step = this.step, size = this.size, x = y = z = 0;
        for (z=0; z < size; z += step){
            ctx.fillStyle = this.color(0, 0, z);
            ctx.fillRect(0, z, width, z + step);
        }
    },

    drawXYPicker: function (){
        var ctx = this.xyPicker.getContext('2d'); 
        var step = this.step, size = this.size, z = this.z, x, y;
        for (x = 0; x < size; x += step) for (y = 0; y < size; y += step){
            ctx.fillStyle = this.color(x, y, z);
            ctx.fillRect(x, y, x + step, y + step);
        }
    },

    color: function (x, y, z){
        var scale = 255/this.size;
        return 'rgb('+[~~(scale*x), ~~(scale*y), ~~(scale*z)].join(', ')+')';
    },

    fireChange: function (){
        var change = document.createEvent("HTMLEvents");
        change.initEvent("change", true, true);
        this.input.dispatchEvent(change);
    }
};

(function (){
    var container = $("#ColorPicker");
    var pickRed = $.child(container, ".pickRed");
    var pickColor = $.child(container, ".pickGreenBlue");
    var rgbValue = $.child(container, "input[type=color]");
    var sample = $.child(container, ".sample");
    var saveToPaletteLink = $.child(container, ".saveToPalette");
    var step = 10, r =  g =  b = 0;
    var palette = ["#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF"];
    var paletteElements = $.children(container, ".palette li");
    var globals = $.globals;

    drawRed();
    drawGB();
    renderPalette();

    setColor(rgbToHex(r, g, b));

    if (globals.isTouchDevice){
        pickRed.addEventListener("touchmove", function (event){
            var point = $.getPoint(event, this);
            pickRedAtPoint(point);
        });

        pickColor.addEventListener("touchmove", function (event){
            var point = $.getPoint(event, this);
            pickColorAtPoint(point);
        });

        pickColor.addEventListener("touchend", fireChange);
    } else {
        pickRed.addEventListener("mousemove", function (event){
            if (globals.mousedown){
                event.preventDefault();
                var point = $.getPoint(event, this);
                pickRedAtPoint(point);
            }
            event.stopPropagation();
        });

        pickColor.addEventListener("mousemove", function (event){
            if (globals.mousedown){
                event.preventDefault();
                var point = $.getPoint(event, this);
                pickColorAtPoint(point);
            }
            event.stopPropagation();
        });

        pickColor.addEventListener("mouseup", fireChange);
    }

    saveToPaletteLink.addEventListener('click', function (event){
        var hexColor = rgbToHex(r, g, b);
        if (palette.indexOf(hexColor) === -1){
            pushToPalette(hexColor);
        }
    });

    paletteElements.forEach(function (el){
        el.addEventListener('click', function (){
            setColor(this.getAttribute('data-color'));
            fireChange();
        });
    });

    return rgbValue;

    function drawRed(){
        var ctx = pickRed.getContext('2d'),
        width = pickRed.getAttribute('width'); 

        for (var y = 0; y < 256; y += step){
            ctx.fillStyle = 'rgb('+y+', 0, 0)';
            ctx.fillRect(0, y, width, y + step);
        }
    }

    function drawGB(){
        var x, y, ctx = pickColor.getContext('2d');

        for (x=0; x < 256; x+=step) for (y=0; y < 256; y+=step) {
            ctx.fillStyle = 'rgb('+r+','+x+', '+y+')';
            ctx.fillRect(x, y, x + step, y + step);
        }
    }

    function setColor(color){
        rgbValue.setAttribute('value', color);
        sample.setAttribute('style', 'background: ' + color + '; ');
    }

    function fireChange(){
        var change = document.createEvent("HTMLEvents");
        change.initEvent("change", true, true);
        rgbValue.dispatchEvent(change);
    }

    function pickColorAtPoint(point){
        g = ~~(limit(point.x, 0, 255));
        b = ~~(limit(point.y, 0, 255));
        setColor(rgbToHex(r, g, b));
    }

    function pickRedAtPoint(point){
        r = point.y;
        r = Math.floor(limit(r, 0, 255));
        drawGB();
    } 

    function pushToPalette(color){
        palette.unshift(color);
        palette.pop();
        renderPalette();
    }

    function renderPalette(){
        palette.forEach(function (color, index){
            paletteElements[index].setAttribute('style', "background: "+color);
            paletteElements[index].setAttribute('data-color', color);
        });
    }

    function limit(n, min, max){
        return Math.min(Math.max(n, min), max);
    }

    function rgbToHex(r, g, b){
        var s = (r * 65536 + g * 256 + b).toString(16);
        return '#' + pad(s, 6).toUpperCase();

        function pad(s, l){
            if (s.length < l){
                return repeat('0', l - s.length) + s;
            } else return s;
        }

        function repeat(s, n){
            var o = '';
            while (n--) o+= s;
            return o;
        }
    }
}());
