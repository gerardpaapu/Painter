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

ipaint.upload = function (data){
    var data = ipaint.painter.layers.getMergedData();
    data = /,(.*)$/.exec(data);
    data = data && data[1];
    if (data) {
        try {
            sendPost({
                'url': "http://gerardpaapu.com/upload",
                'data': {'data': data},
                'onSuccess': function (){
                    alert("uploaded to: " + this.responseText);
                },

                'onFail': function (){ alert("Image Upload Failed") }
            });
        } catch (err) {
            console.log(err);
        }
    }
};
