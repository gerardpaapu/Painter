var Color, ColorPicker;
Color = function (x, y, z, maximum){
    var min = Math.min;
    maximum = maximum || 1;

    if (!(this instanceof Color)) {
        return new Color(x, y, z, max);
    } else {
        this.x = min(x, maximum) / maximum;
        this.y = min(y, maximum) / maximum;
        this.z = min(z, maximum) / maximum;
        return this;
    }
};
Color.cache = {};
Color.prototype = {
    'toRGB': function (){
        return (
            "rgb(" + ~~(this.x * 255) +
             ", "  + ~~(this.y * 255) +
             ", "  + ~~(this.z * 255) + ")"
        );
    },

    'toHex': function (){
        function pad(str, padding, length){
            while (str.length < length) {
                str = padding + str;
            }
            return str;
        }

        function hexComponent(n){ 
            n = ~~(255 * n);
            return pad(n.toString(16), '0', 2).toUpperCase();
        }

        return (
            "#" + 
            hexComponent(this.x) +
            hexComponent(this.y) +
            hexComponent(this.z)
        );
    }
};

Color.toRGB = function (x, y, z, scale){
    return new Color(x, y, z, scale).toRGB();
};

Color.toHex = function (x, y, z, scale){
    var key = "hex:"+x+','+y+','+z+','+scale;
    if (Color.cache.hasOwnProperty(key)){
        return Color.cache[key];
    } else {
        return (Color.cache[key] = new Color(x, y, z, scale).toHex());
    }
};

Color.fromRGB = function (r, g, b){
    return new Color(r, g, b, 255);
};

Color.fromHex = function (hex){
   var match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
   return !match ? new Color(0, 0, 0)
       :  new Color(
           parseInt(match[1], 16), 
           parseInt(match[2], 16),
           parseInt(match[3], 16),
           255
       ); 
};

ColorPicker = function (options){
    $.extend(this, options);
    this.palette = $.array(this.palette);
    this.createElements();
    this.setupEvents();
};
ColorPicker.prototype = {
    // x, y, z are used as generic stand-ins for color-cube coordinates
    // like r, g, b or H, S, L or whatever
    x: 0, y: 0, z: 0,

    zPickerWidth: 29,

    // size sets the height of the zPicker and the height and width of the xyPicker
    size: 255,  

    // draws the picking regions in increments of `step` (to save performance)
    step: 10,

    palette: ["#000000", "#0000FF","#00FF00","#FF0000", "#FFFF00"],

    createElements: function (){
        this.container = $.element('div', {'class': "colorpicker"});
        this.zPicker = $.element('canvas', {width: this.zPickerWidth, height: this.size});
        this.xyPicker = $.element('canvas', {width: this.size, height: this.size});
        this.input = $.element('input', {type: "color", value: "#000000"});
        this.sample = $.element('div', {'class': "sample"});
        this.saveButton = $.element('input', {type: "button", value: 'save'});
        this.paletteSwatches = this.palette.map(function (color){
            return $.element("li", {'class': "swatch"});
        });

        var list = $.element('ul', {'class': "palette"});
        var controls = $.element('div', {'class': "controls"});
        var canvasWrapper = $.element('div', {'class': "canvasWrapper"});

        $.adopt(list, this.paletteSwatches);
        $.adopt(controls, [this.input, this.sample, this.saveButton]);
        $.adopt(canvasWrapper, [this.zPicker, this.xyPicker]);
        $.adopt(this.container, [canvasWrapper, controls, list]);

        this.renderPalette();
        this.drawXYPicker();
        this.drawZPicker();
        this.setHex(this.palette[0]);
    },

    setupEvents: function (){
        var picker = this,
            length = this.paletteSwatches.length,
            i, element, loadColor;

        loadColor = function (){
            var color = this.getAttribute('data-color');
            picker.setHex(color);
        };

        for (i = 0; i < length; i++){
            this.paletteSwatches[i].addEventListener('click', loadColor);
        }
        $.gesture({
            element: this.zPicker,

            bind: this,

            move: function (event, point){
                event.preventDefault();
                this.z = point.y;
                this.drawXYPicker();
            } 
        });

        $.gesture({
            element: this.xyPicker,

            bind: this,

            move: function (event, point){
                event.preventDefault();
                this.x = point.x;
                this.y = point.y;
                this.updateSample();
            },

            end: function (event, point){
                this.setInputValue();
                this.fireChange();
            }
        });

        this.saveButton.addEventListener('click', function (){
            picker.save();
        });
    },

    updateSample: function (){
        this.sample.setAttribute('style', "background: " + this.getHex());
    },

    setInputValue: function (){
       this.input.setAttribute('value', this.getHex()); 
    },

    drawZPicker: function (){
        var ctx = this.zPicker.getContext('2d'),
            width = this.zPickerWidth,
            step = this.step,
            size = this.size,
            x, y, z;

        for (x = y = z = 0; z < size; z += step){
            ctx.fillStyle = Color.toHex(x, y, z, size);
            ctx.fillRect(0, z, width, z + step);
        }
    },

    drawXYPicker: function (){
        var ctx = this.xyPicker.getContext('2d'),
            step = this.step,
            size = this.size,
            z = this.z,
            x, y;

        for (x = 0; x < size; x += step){
            for (y = 0; y < size; y += step){
                ctx.fillStyle = Color.toHex(x, y, z, size);
                ctx.fillRect(x, y, x + step, y + step);
            }
        }
    },

    getRGB: function (){
        return Color.toRGB(this.x, this.y, this.z, this.size);
    },

    getHex: function (){
        return Color.toHex(this.x, this.y, this.z, this.size);
    },

    save: function (){
        this.palette.unshift(this.getHex());
        this.palette.pop();
        this.renderPalette();
    },

    renderPalette: function (){
        var elements = this.paletteSwatches,
            len = elements.length, 
            palette = this.palette, 
            i, element;

        for (i = 0; i < len; i++){
            element = elements[i];
            element.setAttribute('style', 'background:' + palette[i]);
            element.setAttribute('data-color', palette[i]);
        }
    },

    setHex: function (hex){
        var color = Color.fromHex(hex);
        this.x = color.x * this.size;
        this.y = color.y * this.size;
        this.z = color.z * this.size;
        this.updateSample();
        this.setInputValue();
        this.fireChange();
    },
    
    fireChange: function (){
        var change = document.createEvent("HTMLEvents");
        change.initEvent("change", true, true);
        this.input.dispatchEvent(change);
    }
};
