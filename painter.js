var Painter, Layer, LayerCollection, Brush;
// Painter - A Facade Class for painting on multiple layers {{{
Painter = function (options){
    options = options || {};
    this.width = options.width   || 600;
    this.height = options.height || 400;
    this.layers = options.layers || new LayerCollection(this.width, this.height);
    this.brush = options.brush || new Brush();
    this.createElement();
    this.setCurrentLayer(0);
    this.zoom = this.inverseZoom = 1;
    this.offset = {x: 0, y: 0};
};

Painter.prototype = {
    'createElement': function (){
        if (this.element){
            return false;
        }

        this.element = $.element("div", {
            'class': "painterView",
            'style': (
                "width: " + this.width + "px; " +
                "height: " + this.height + "px;" +
                "-webkit-transform-origin: 0 0;"
             ) 
        });

        this.element.appendChild(this.layers.element);
    },
    
    'beginPath': function (){
        this.currentLayer.context.beginPath();
    },

    'adjustPoint': function (point){
        return {
            x: point.x * this.inverseZoom + this.offset.x,
            y: point.y * this.inverseZoom + this.offset.y
        };
    },

    'moveTo': function (point){
        point = this.adjustPoint(point);
        this.currentLayer.context.moveTo(point.x, point.y);
    },

    'lineTo': function (point){
        point = this.adjustPoint(point);
        var context = this.currentLayer.context;
        context.lineTo(point.x, point.y);
        context.stroke();
    },

    'setCurrentLayer': function (index){
        this.currentIndex = index;
        this.currentLayer = this.layers.get(index);
        this.currentLayer.loadBrush(this.brush);
    },

    'getCurrentLayer': function (){
        return this.currentLayer;
    },

    'setBrush': function (brush){
        this.brush = brush;
        this.currentLayer.loadBrush(this.brush);
    },

    'getBrush': function (){
        return this.brush; 
    },

    'updateBrush': function (data){
        this.brush.load(data);
        this.currentLayer.loadBrush(this.brush);
    },

    'setZoom': function (zoom){
        this.zoom = zoom;
        this.inverseZoom = 1 / zoom;
        this.setTransform();
    },

    'setOffset': function (x, y){
        this.offset.x = x;
        this.offset.y = y;
        this.setTransform();
    },

    'setTransform': function (){
        this.element.style["-webkit-transform"] = (
            "scale(" + this.zoom + ") " +
            "translate(" + (-this.offset.x) + "px, " + (-this.offset.y) + "px)"
        );
    }
};

Painter.fromJSON = function (json){
    var data = JSON.parse(json);
    return new Painter({
        'width': data.width,
        'height': data.height, 
        'layers': LayerCollection.from(json)
    });
};
// }}}
// LayerCollection {{{
LayerCollection = function (width, height){
    this.width = width;
    this.height = height;
    this.items = [];
    this.createElement();
    this.createLayer('Background');
};

LayerCollection.prototype = {
    'createElement': function (){
        if (!this.element){
            this.element = $.element('div', {
                'class': "layerContainer",
                'style': "width: " + this.width + "px; " +
                         "height: " + this.height + "px;"
            });
        }
    },

    'createLayer': function (name, where){
        var layer = new Layer(name, this.width, this.height);
        this.insertLayer(layer, where);

        return layer;
    },

    'insertLayer': function (layer, where){
        var index = this.index(where || "top");
        this.element.insertBefore(layer.canvas, this.element.children[index]);
        this.items.splice(index, 0, layer);
    },

    'removeLayer': function (layer){
        layer = this.get(layer);
            
        if (layer){
            var index = this.items.indexOf(layer);
            this.items.splice(index, 1);
            this.element.removeChild(layer.canvas);
        }

        return layer;
    },

    'moveLayer': function (layer, where){
        this.insertLayer(this.removeLayer(layer), where);
    },

    'index': function (where){
        return typeof(where) === "number" ? where
            :  where === "above"  ? this.currentIndex + 1
            :  where === "below"  ? this.currentIndex
            :  where === "bottom" ? 0
            :  this.items.length; // assume top
    },

    'get': function (layer){
        var items = this.items;
        return items.indexOf(layer) > -1 ? (layer instanceof Layer && layer) 
            :  layer === 'top' ? items[items.length - 1]
            :  items[layer] || null;
    },

    'getMergedData': function (){
        var canvas = $.element("canvas", {'width': this.width, 'height': this.height});
        var ctx = canvas.getContext("2d");

        this.items.forEach(function (layer){
            var image = new Image();
            image.onload = function (){
                ctx.drawImage(image, 0, 0);
            };

            image.src = layer.canvas.toDataURL();
        });  

        return canvas.toDataURL();
    },

    'toJSON': function (){
        return JSON.stringify({
            'width': this.width, 
            'height': this.height,
            'layers': this.items.map(function (layer){
                return layer.toJSON();
            })
        });
    } 
};

LayerCollection.fromJSON = function (str){
    var data = JSON.parse(str), layer,
        layers = new LayerCollection(data.width, data.height);

    for (var name in data) {
        if (data.hasOwnProperty(name)) {
            layers.createLayer(name).loadImage(data[name]);
        }
    }

    return layers;
};
// }}}
// Layer {{{
Layer = function (name, width, height){
    this.name = name;
    this.canvas = $.element("canvas", {
        'width': width,
        'height': height,
        'data-name': name
    });

    this.context = this.canvas.getContext('2d');
};

Layer.prototype = {
    'loadImage': function (uri, preserve){
        var layer = this,
            image = $.element('image');
        
        image.onload = function (){
            if (!preserve) {
                layer.clear();
            }

            layer.context.save();
            layer.context.globalCompositeOperation = "source-over";
            layer.context.drawImage(image, 0, 0);
            layer.context.restore();
        };

        image.src = uri;
    },

    'clear': function (){
        var canvas = this.canvas;
        this.context.clearRect(0, 0, canvas.width, canvas.height);
    },

    'loadBrush': function (brush){
        var ctx = this.context;
        ctx.lineWidth = brush.size;
        ctx.lineCap = ctx.lineJoin = brush.style;
        ctx.strokeStyle = brush.getRGBA();
        ctx.globalCompositeOperation = brush.getCompositeOperation();
    },

    'toJSON': function (){
        return JSON.stringify({
            name: this.name,
            data: this.context.getDataURI()
        });
    }
};
// }}}
// Brush {{{
Brush = function (data){
    if (data){
        this.load(data);
    }
};

Brush.prototype = {
    'color': [0, 0, 0],
    'opacity': 1,
    'style': "round",
    'size': 10,

    'getRGBA': function (){
        var components = this.color.concat([this.opacity]); 
        return "rgba(" + components.join(", ") + ")";
    },

    'setSize': function (size){
        this.size = Math.max(parseInt(size, 10), 1); 
    },

    'setOpacity': function (opacity){
        opacity = parseFloat(opacity, 10);
        opacity = Math.min(opacity, 1);
        this.opacity = Math.max(opacity, 0);
    },

    'setColorRGB': function (r, g, b){
        function clean (n){
            // ensure that n is an integer (0 - 255)
            n = parseInt(n, 10);
            n = Math.max(n, 0);
            n = Math.min(n, 255);
            return n;
        }

        this.color = [clean(r), clean(g), clean(b)];
    },

    'setColorHex': function (str){
       var match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(str);
       if (!match){
           this.setColorRGB(0, 0, 0);
       } else {
           this.setColorRGB(
               parseInt(match[1], 16), 
               parseInt(match[2], 16),
               parseInt(match[3], 16)
           );
       }
    },

    'setMode': function (mode){
        this.mode = (Brush.modes.hasOwnProperty(mode) ? mode : "paint");
    },

    'getCompositeOperation': function (){
        return Brush.modes[this.mode];
    },

    'load': function (data){
        if (data.rgb) { 
            this.setColorRGB.apply(this, data.rgb); 
        }

        if (data.hex) {
            this.setColorHex(data.hex); 
        }
        
        if (data.opacity) { 
            this.setOpacity(data.opacity); 
        }
        
        if (data.size) { 
            this.setSize(data.size); 
        }
        
        if (data.style) { 
            this.setStyle(data.style); 
        }

        if (data.mode) {
            this.setMode(data.mode);
        }
    }
};

Brush.modes = {
    // friendly names for the composite operations
    'paint': "source-over",
    'erase': "destination-out",
    'behind': "destination-over",
    'inside': "source-atop",
    'lighten': "lighter",
    'darken': "darker"
};

Brush.fromJSON = function (json){
    var brush = new Brush();
    brush.load(JSON.parse(json));
    return brush;
};
// }}}
