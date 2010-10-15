(function (){
    var wrapper = $('#ControlsWrapper'),
        controls = $('#Controls'),
        showHide = $('#ControlsShowHide'),
        controlsVisible = true;

    hideControls();

    showHide.addEventListener('click', toggleControls, false);

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

    function BrushControl(element, attr){
        // Brush Controls link a select or input element
        // to a brush value.
        var control = this;
        this.attr = attr;
        UIComponent.call(this, element, function (value){
            control.updateBrush(value);
        });
    }

    BrushControl.prototype = clone(UIComponent.prototype);
    BrushControl.prototype.painter = painter;
    BrushControl.prototype.updateBrush = function (value){
        var opt = {};
        opt[this.attr] = value;
        this.painter.updateBrush(opt);
    };

    painter.ui = {
        colorpicker: new BrushControl("#ColorPicker input[type=color]", 'color'),
        opacity: new BrushControl("#Opacity", 'opacity'),
        mode: new BrushControl("#Mode", 'mode'),
        size: new BrushControl("#BrushSize", 'size')
    };
}());
