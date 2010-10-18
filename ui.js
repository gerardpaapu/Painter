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

    $("#Controls").appendChild(colorPicker.container);

    var layerpicker = $.element("select", {id: "Layers"}); 
    for (var i=0; i < 10; i++){
        $.inject(
            $.element("option", {value: ''+i, html: "layer "+i}),
            layerpicker
        );
    }
    $("#Controls").appendChild(layerpicker);

    var ui = ipaint.ui = {
        colorPicker: colorPicker,
        colorPickerInput: new BrushControl(colorPicker.input, 'hex'),
        opacity: new BrushControl("#Opacity", 'opacity'),
        mode: new BrushControl("#Mode", 'mode'),
        size: new BrushControl("#BrushSize", 'size'),
        painter: painter.element,
        layers: new UIComponent(layerpicker, function (value){
            painter.setCurrentLayer(parseInt(value, 10));
        })
    };

    $.gesture({
        element: ui.painter,
        bind: painter,
        start: function (event, point){
            event.preventDefault();
            this.beginPath();
            this.moveTo(point.x, point.y);
        },

        move: function (event, point){
            event.preventDefault();
            this.lineTo(point.x, point.y);
        }
    });
}());
(function (){
    // Show and hide the controls
    var wrapper = $('#ControlsWrapper'),
        controls = $('#Controls'),
        showHide = $('#ControlsShowHide'),
        controlsVisible = true;

    function toggleControls(event){
        event.preventDefault();
        if (controlsVisible){
            hideControls();
        } else {
            showControls();
        }
    }

    function showControls(){
        wrapper.style.bottom = 0;
        showHide.innerHTML = "Hide Tools";
        controlsVisible = true;
    }

    function hideControls(){
        var height = controls.clientHeight;
        wrapper.style.bottom = (-height) + 'px';
        showHide.innerHTML = "Show Tools";
        controlsVisible = false;
    }

    hideControls();

    showHide.addEventListener('click', toggleControls);


    window.addEventListener('orientationchange', function (event){
        var orientation = getOrientation();
        if (orientation.portrait){
            $("#ColorPicker").style.display = "block";
        } else {
            $("#ColorPicker").style.display = "none";
        }

        if (controlsVisible){
            showControls();
        } else {
            hideControls();
        }
    });
}());
