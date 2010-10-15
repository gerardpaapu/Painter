var ipaint = {
    g: {} // a place for random globals
};

ipaint.painter = (function (){
    var container = $('#MainWrapper'),
        size = Math.max(container.clientWidth, container.clientHeight),
        painter = new Painter({width: size, height: size}),
        el = painter.element;
    
    container.insertBefore(el, container.children[0]);
    return painter;
}());

