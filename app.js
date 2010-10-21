var ipaint = {
    g: {} // a place for random globals
};

$.lockLayout();

ipaint.painter = (function (){
    var container = $('#MainWrapper'),
        size = Math.max(container.clientWidth, container.clientHeight),
        painter = new Painter({width: size, height: size}),
        el = painter.element, i;

    container.insertBefore(el, container.children[0]);
    return painter;
}());

ipaint.upload = function (){
    var data;
    data = ipaint.painter.layers.getMergedData();
    data = /,(.*)$/.exec(data);
    data = data && data[1];

    if (data) {
        try {
            $.sendPost({
                'url': "/upload",
                'data': {'data': data},
                'onSuccess': $.alert("uploaded to {responseText}"),
                'onFail':  $.alert("upload failed: {responseText}")
            });
        } catch (err) {
            $.log(err);
        }
    }
};
