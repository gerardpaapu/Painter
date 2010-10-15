(function (){
    var g = $.globals, painter = ipaint.painter;
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

    var ui = ipaint.ui = {
        colorpicker: new BrushControl("#ColorPicker input[type=color]", 'hex'),
        opacity: new BrushControl("#Opacity", 'opacity'),
        mode: new BrushControl("#Mode", 'mode'),
        size: new BrushControl("#BrushSize", 'size'),
        upload: (function (){
            var el = $("#Upload");
            var fn = function (event){
                ipaint.upload();
            };

            el.addEventListener('click', fn);
            return {
                element: el,
                handler: fn
            };
        }()),
        painter: painter.element
    };

    $("#ControlsWrapper").addEventListener('mousedown', stopEvent, false);
    $("#ControlsWrapper").addEventListener('mousemove', stopEvent, false);

    function stopEvent(event){
        event.stopPropagation();
        return false;
    }

    if (g.isTouchDevice){    
        ui.painter.addEventListener('touchstart', function (event){
            var point = getPoint(event, this);

            painter.beginPath();
            painter.moveTo(point.x, point.y);
        }, false);

        ui.painter.addEventListener('touchmove', function (event){
            var point = getPoint(event, this);

            painter.lineTo(point.x, point.y);
        }, false);
    } else {
        g.mousedown = false;
        window.addEventListener('mousedown', function (){ g.mousedown = true; }, true);
        window.addEventListener('mouseup', function (){ g.mousedown = false; }, true);

        (ui.painter).addEventListener('mousedown', function (event){
            var point = getPoint(event, this);
            painter.beginPath();
            painter.moveTo(point.x, point.y);    
        }, false);

        (ui.painter).addEventListener('mousemove', function (event){
           if (g.mousedown){
                var point = getPoint(event, this);
                painter.lineTo(point.x, point.y);
                event.preventDefault();
           } 
        }, false);
    } 
}());
(function (){
    // Show and hide the controls
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

    window.addEventListener('orientationchange', function (event){
        var orientation = getOrientation();
        if (orientation.portrait){
            $("#ColorPicker").style.display = "block";
        } else {
            $("#ColorPicker").style.display = "none";
        }

        if (controlsVisible) showControls();
        else hideControls();
    });
}());
