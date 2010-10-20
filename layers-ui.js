var LayerUI = function (painter){
    this.painter = painter;
    this.layers = painter.layers;
    this.makeElements();
};
LayerUI.prototype = {
    'makeElements': function (){
        var i = 0, length = this.layers.items.length, layerUI = this;
        this.container = $.element('div', {'class': "layerUI"});
        this.layersWrapper = $.element('ul', {'class': "layersWrapper"});
        this.layerElements = [];

        for (; i < length; i++){
            this.layerElements[i] = this.elementFrom(this.layers.items[i]);
        }

        this.newLayerButton = $.element('a', {
            'class': "newLayer button",
            href: "#new-layer",
            html: "New Layer"
        });
        
        this.newLayerButton.addEventListener('click', function (){
            var name = window.prompt("new layer", "untitled"),
                layer = layerUI.layers.createLayer(name),
                index = layerUI.layers.items.indexOf(layer),
                element = layerUI.elementFrom(layer),
                wrapper = layerUI.layersWrapper,
                children = wrapper.children;
            
            wrapper.insertBefore(element, children[i + 1]);
            layerUI.layerElements = $.array(wrapper.children);
        });

        $.adopt(this.layersWrapper, this.layerElements);
        $.adopt(this.container, [this.newLayerButton, this.layersWrapper]);
    },

    'elementFrom': function (layer){
        var name = $.element('span', {'class': "layerName", html: layer.name}),
            moveUp = $.element('a', {'class': "moveUp", html: "&uarr;"}),
            moveDown = $.element('a', {'class': "moveDown", html: "&darr;"}),
            deleteButton = $.element('a', {'class': "delete button", html: "x"}),
            toggleVisible = $.element('a', {'class': "toggleVisible button", html: "hide"}),
            container = $.element('li', {'class': "layer"}),
            layersUI = this;

        if (layer.visible){
            $.addClass(toggleVisible, "visible");
        }

        $.adopt(container, [name, moveUp, moveDown, deleteButton, toggleVisible]);

        name.addEventListener('click', function (event){
            layersUI.setCurrent(layer, container);
        });

        moveUp.addEventListener('click', function (event){
            layersUI.moveUp(layer, container);
        });

        moveDown.addEventListener('click', function (event){
            layersUI.moveDown(layer, container);
        });

        deleteButton.addEventListener('click', function (event){
            layersUI.deleteLayer(layer, container);
        });

        toggleVisible.addEventListener('click', function (event){
            layersUI.toggleVisible(layer, container);
        });

        return container;
    },

    moveLayer: function (layer, element, where){
        var container = this.layersWrapper,
            elements = container.children,
            index = [].indexOf.call(elements, element);

        if (index === -1){
            $.log('bad layer: ', layer);
            return false;
        }
        
        if (where < length && where >= 0){
            this.painter.layers.moveLayer(index, where);
            elements.insertBefore(element, children[where + 1]); 
            this.layerElements = $.array(elements);
            return true;
        } else {
            $.log('bad index');
            return false;
        } 
    },

    moveUp: function (layer, element){
        var index = this.layerElements.indexOf(element);        
        return this.moveLayer(layer, element, index + 1);
    },

    moveDown: function (layer, element){
        var index = this.layerElements.indexOf(element);        
        return this.moveLayer(layer, element, index - 1);
    },

    deleteLayer: function (layer, element){
        this.container.removeChild(element);
        this.layers.removeLayer(layer);
    },

    toggleVisible: function (layer, element){
        layer.toggleVisible();
        $.toggleClass(element, 'visible');
    },

    setCurrent: function (layer, element){
        this.painter.setCurrentLayer(layer);
        $.removeClass(this.current);
        $.addClass(element);
        this.current = element;
    }
};

