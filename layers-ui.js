var LayerUI, LayerView;

LayerUI = function (painter){
    this.painter = painter;
    this.model = painter.layers;
    this.makeElements();
};
LayerUI.prototype = {
    'makeElements': function (){
        var layers = this.model.items,
            length = this.model.items.length,
            layerUI = this,
            i, layer;

        this.layers = [];
        this.container = $.element('div', {'class': "layerUI"});
        this.layersWrapper = $.element('ul', {'class': "layersWrapper"});

        for (i = 0; i < length; i++){
            layer = this.layers[i] = new LayerView(layers[i], this, this.painter);
            this.layersWrapper.appendChild(layer.element);
        }

        this.setCurrent(this.layers[0]);
        this.reorder();
        this.newLayerButton = $.element('a', {
            'class': "newLayer button",
            href: "#new-layer",
            html: "New Layer"
        });
        
        this.newLayerButton.addEventListener('click', function (){
            var name = window.prompt("new layer", "untitled");
            layerUI.newLayer(name);
        });
        
        $.adopt(this.container, [this.newLayerButton, this.layersWrapper]);
    },
    
    newLayer: function (name){
        var model = this.model.createLayer(name),
            view = new LayerView(model, this, this.painter),
            wrapper = this.layersWrapper;

        wrapper.appendChild(view.element);
        this.layers.push(view);
        this.reorder();
    },

    reorder: function (){
        var layers = this.layers,
            wrapper = this.layersWrapper,
            i = layers.length, layer, j;

        layers.sort(function (a, b){
            return a.getIndex() > b.getIndex();
        });
        
        $.emptyElement(wrapper);
        
        while (i--){
            layer = layers[i];
            if (layer.getIndex() === -1) {
                layers.splice(layer.getIndex(), 1);
            } else { 
                wrapper.appendChild(layer.element);
            }
        }
    },

    setCurrent: function (item){
        var layer = item.model,
            element = item.element;

        this.painter.setCurrentLayer(layer);
        if (this.current){
            $.removeClass(this.current, 'current');
        }
        $.addClass(element, 'current');
        this.current = element;
    }
};

LayerView = function (model, parentUI, painter){
    // Performs the UI functions for a single layer
    this.model = model;       // Layer
    this.parentUI = parentUI; // LayerUI
    this.painter = painter;   // Painter

    this.createElements();
    this.bindEvents();
}
LayerView.prototype = {
    createElements: function (){
        var buttons = this.buttons = {
            setCurrent: $.element('span', {
                'class': "layerName button", 
                html: this.model.name, href: "#"
            }),

            moveUp: $.element('a', {
                'class': "moveUp button",
                html: "&uarr;", href: "#"
            }),

            moveDown: $.element('a', {
                'class': "moveDown button", 
                html: "&darr;", href: "#"
            }),

            remove: $.element('a', {
                'class': "remove button",
                html: "x", href: "#"
            }),

            toggleVisible: $.element('a', {
                'class': "toggleVisible button", 
                html: "hide", href: "#"
            })
        };
        this.element = $.element('li', {'class': "layer"});
        $.adopt(this.element, [
               buttons.setCurrent, 
               buttons.moveDown, 
               buttons.moveUp, 
               buttons.remove, 
               buttons.toggleVisible
        ]);
    },

    bindEvents: function (){
        var buttons =  this.buttons, ui = this;
        $.mapObject(buttons, function(item, name){
            item.addEventListener('click', function (event){
                event.preventDefault();
                ui[name](item);
            });
        });
    },

    getIndex: function (){
        return this.painter.layers.items.indexOf(this.model);
    },

    moveTo: function (where){
        this.painter.layers.moveLayer(this.model, where);
        this.parentUI.reorder();
    },

    moveUp: function (){
        this.moveTo(this.getIndex() + 1);
    },

    moveDown: function (){
        this.moveTo(this.getIndex() - 1);
    },

    toggleVisible: function (){
        this.model.toggleVisible();
        $.toggleClass(this.element, 'hidden');
    },

    remove: function (){
        this.painter.layers.removeLayer(this.model);
        this.parentUI.reorder();
    },

    setCurrent: function (){
        this.parentUI.setCurrent(this);
    }
};
