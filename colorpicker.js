var ColorPicker;

ColorPicker  = function (options){
    options = options || {};
    this.width = options.width;
    this.height = options.height;
    this.createElements();
    this.setupEvents();
    this.x = this.y = this.z = 0;
};
ColorPicker.prototype = {
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
        var step = this.step, size = this.size, x, y, z;
        for (x = y = z = 0; z < size; z += step){
            ctx.fillStyle = this.color(0, 0, z);
            ctx.fillRect(0, z, width, z + step);
        }
    },

    drawXYPicker: function (){
        var ctx = this.xyPicker.getContext('2d'); 
        var step = this.step, size = this.size, z = this.z, x, y;
        for (x = 0; x < size; x += step){
            for (y = 0; y < size; y += step){
                ctx.fillStyle = this.color(x, y, z);
                ctx.fillRect(x, y, x + step, y + step);
            }
        }
    },

    color: function (x, y, z){
        var scale = 255/this.size;
        var components = [
            ~~(scale * x),
            ~~(scale*y), 
            ~~(scale*z)
        ];

        return 'rgb(' + components.join(', ') + ')';
    },

    fireChange: function (){
        var change = document.createEvent("HTMLEvents");
        change.initEvent("change", true, true);
        this.input.dispatchEvent(change);
    }
};
