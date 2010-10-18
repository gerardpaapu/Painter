(function (){
    var container = $("#ColorPicker");
    var pickRed = $.child(container, ".pickRed");
    var pickColor = $.child(container, ".pickGreenBlue");
    var rgbValue = $.child(container, "input[type=color]");
    var sample = $.child(container, ".sample");
    var saveToPaletteLink = $.child(container, ".saveToPalette");
    var step = 10, r = 0, g = 0, b = 0;
    var palette = ["#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF"];
    var paletteElements = $.children(container, ".palette li");
    var globals = $.globals;

    function drawRed(){
        var ctx = pickRed.getContext('2d'),
        width = pickRed.getAttribute('width'); 

        for (var y = 0; y < 256; y += step){
            ctx.fillStyle = 'rgb('+y+', 0, 0)';
            ctx.fillRect(0, y, width, y + step);
        }
    }

    function drawGB(){
        var x, y, ctx = pickColor.getContext('2d');

        for (x=0; x < 256; x+=step) {
            for (y=0; y < 256; y+=step) {
                ctx.fillStyle = 'rgb('+r+','+x+', '+y+')';
                ctx.fillRect(x, y, x + step, y + step);
            }
        }
    }

    function setColor(color){
        rgbValue.setAttribute('value', color);
        sample.setAttribute('style', 'background: ' + color + '; ');
    }

    function fireChange(){
        var change = document.createEvent("HTMLEvents");
        change.initEvent("change", true, true);
        rgbValue.dispatchEvent(change);
    }

    function pickColorAtPoint(point){
        g = ~~(limit(point.x, 0, 255));
        b = ~~(limit(point.y, 0, 255));
        setColor(rgbToHex(r, g, b));
    }

    function pickRedAtPoint(point){
        r = point.y;
        r = Math.floor(limit(r, 0, 255));
        drawGB();
    } 

    function pushToPalette(color){
        palette.unshift(color);
        palette.pop();
        renderPalette();
    }

    function renderPalette(){
        palette.forEach(function (color, index){
            paletteElements[index].setAttribute('style', "background: "+color);
            paletteElements[index].setAttribute('data-color', color);
        });
    }

    function limit(n, min, max){
        return Math.min(Math.max(n, min), max);
    }

    function rgbToHex(r, g, b){
        function pad(s, l){
            if (s.length < l){
                return repeat('0', l - s.length) + s;
            } else {
                return s;
            }
        }

        function repeat(s, n){
            var o = '';
            while (n--){
                o+= s;
            }
            return o;
        }

        var s = (r * 65536 + g * 256 + b).toString(16);
        return '#' + pad(s, 6).toUpperCase();
    }

    drawRed();
    drawGB();
    renderPalette();

    setColor(rgbToHex(r, g, b));

    $.gesture({
        element: pickRed,
        move: function (event, point){
            event.preventDefault();
            pickRedAtPoint(point);
        }
    });
    
    $.gesture({
        element: pickColor,
        move: function (event, point){
            event.preventDefault();
            pickColorAtPoint(point);
        },

        end: function (event, point){
            fireChange();
        }
    });

    saveToPaletteLink.addEventListener('click', function (event){
        var hexColor = rgbToHex(r, g, b);
        if (palette.indexOf(hexColor) === -1){
            pushToPalette(hexColor);
        }
    });

    paletteElements.forEach(function (el){
        el.addEventListener('click', function (){
            setColor(this.getAttribute('data-color'));
            fireChange();
        });
    });

    return rgbValue;
}());
