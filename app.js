var painter = (function (){
    var container = $('#MainWrapper'),
        size = Math.max(container.clientWidth, container.clientHeight),
        painter = new Painter({width: size, height: size}),
        el = painter.element;
    
    container.insertBefore(el, container.children[0]);
    
    el.addEventListener('touchstart', function (event){
        var point = getPoint(event, el);

        painter.beginPath();
        painter.moveTo(point.x, point.y);
    });

    el.addEventListener('touchmove', function (event){
        var point = getPoint(event, el);

        painter.lineTo(point.x, point.y);
    });

    window.mousedown = false;
    window.addEventListener('mousedown', function (){ window.mousedown = true; }, true);
    window.addEventListener('mouseup', function (){ window.mousedown = false; }, true);

    el.addEventListener('mousedown', function (event){
        var point = getPoint(event, el);
        painter.beginPath();
        painter.moveTo(point.x, point.y);
    });

    el.addEventListener('mousemove', function (event){
       if (window.mousedown){
            var point = getPoint(event, el);
            painter.lineTo(point.x, point.y);
            event.stopPropagation();
            return false;
       } 
    });

    $("#ControlsWrapper").addEventListener('mousedown', function (event){
        event.stopPropagation();
        return false;
    }, false); 

    return painter;
}.call(this));
