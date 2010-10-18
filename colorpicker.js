var ColorPicker = function (options){
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

        this.drawXYPicker();
        this.drawZPicker();
    },

    setupEvents: function (){
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
    },

    updateSample: function (){
        this.sample.setAttribute('style', "background: " + this.color(this.x, this.y, this.z));
    },

    setInputValue: function (){
       this.input.setAttribute('value', this.getHexValue()); 
    },

    getHexValue: function (){
        function pad(str, padding, length){
            var i = length - str.length;
            while (i--){
                str = padding + str;
            }
            return str;
        }

        function limit(n, min, max){
            return Math.max(Math.min(n, max), min);
        }

        function hexComponent(n){ 
            n = ~~limit(n, 0, 255);
            return pad(n.toString(16), '0', 2).toUpperCase();
        }

        var scale = 255 / this.size,
            components = [
                hexComponent(this.z),
                hexComponent(this.x),
                hexComponent(this.y)
            ];
        
        return "#" + components.join('');
    },

    drawZPicker: function (){
        var ctx = this.zPicker.getContext('2d'),
            width = this.zPickerWidth,
            step = this.step,
            size = this.size,
            x, y, z;

        for (x = y = z = 0; z < size; z += step){
            ctx.fillStyle = this.color(x, y, z);
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
                ctx.fillStyle = this.color(x, y, z);
                ctx.fillRect(x, y, x + step, y + step);
            }
        }
    },

    color: function (x, y, z){
        var scale = 255 / this.size,
            components = [
                ~~(scale * z),
                ~~(scale * x),
                ~~(scale * y) 
            ];

        return 'rgb(' + components.join(', ') + ')';
    },

    save: function (){
        var color = [this.x, this.y, this.z];
        this.palette.push(color);
        this.renderPalette();
    },

    restore: function(color){
        
    },

    fireChange: function (){
        var change = document.createEvent("HTMLEvents");
        change.initEvent("change", true, true);
        this.input.dispatchEvent(change);
    }
};
