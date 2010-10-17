var ipaint = {
    g: {} // a place for random globals
};

$.lockLayout();

ipaint.painter = (function (){
    var container = $('#MainWrapper'),
        size = Math.max(container.clientWidth, container.clientHeight),
        painter = new Painter({width: size, height: size}),
        el = painter.element;
    
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
            sendPost({
                'url': "http://localhost:8675",
                'data': {'data': data},
                'onSuccess': function (){
                    alert("uploaded to: " + this.responseText);
                },

                'onFail': function (){
                    alert("Image Upload Failed");
                }
            });
        } catch (err) {
            $.log(err);
        }
    }
};
