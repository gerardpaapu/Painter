(function (){
    var g = $.globals, painter = ipaint.painter;

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
            var component = this;
            this.element.addEventListener('change', function (event){
                component.update();
            });
        }
    };

    function BrushControl(element, attr){
        // Brush Controls link a select or input element
        // to a brush value.
        var control = this;
        this.attr = attr;
        UIComponent.call(this, element, function (value){
            control.updateBrush(value);
        });
    }

    BrushControl.prototype = $.clone(UIComponent.prototype);
    BrushControl.prototype.painter = painter;
    BrushControl.prototype.updateBrush = function (value){
        var opt = {};
        opt[this.attr] = value;
        this.painter.updateBrush(opt);
    };

    var colorPicker = new ColorPicker();
    var layerUI = new LayerUI(painter);
    $.emptyElement($("#ColorsTab"));
    $.emptyElement($("#LayersTab"));
    $("#ColorsTab").appendChild(colorPicker.container);
    $("#LayersTab").appendChild(layerUI.container);

    var uploadButton = $('#UploadDocument');
    uploadButton.addEventListener('click', function (event){
        ipaint.upload();
    });

    var ui = ipaint.ui = {
        colorPicker: colorPicker,
        colorPickerInput: new BrushControl(colorPicker.input, 'hex'),
        opacity: new BrushControl("#Opacity", 'opacity'),
        mode: new BrushControl("#Mode", 'mode'),
        size: new BrushControl("#BrushSize", 'size'),
        painter: painter.element,
        layers: layerUI,
        upload: uploadButton
    };

    $.gesture({
        element: ui.painter,
        bind: painter,
        start: function (event, point){
            event.preventDefault();
            this.beginPath();
            this.moveTo(point);
        },

        move: function (event, point){
            event.preventDefault();
            this.lineTo(point);
        }
    });
}());
