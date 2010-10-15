(function (){
    var container = c = $("#ColorPicker");
    var pickRed = c.querySelector(".pickRed");
    var pickColor = c.querySelector(".pickGreenBlue");
    var rgbValue = c.querySelector("input[type=color]");
    var sample = c.querySelector(".sample");
    var saveToPaletteLink = c.querySelector(".saveToPalette");
    var step = 10, r =  g =  b = 0;
    var palette = ["#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF"];
    var paletteElements = c.querySelectorAll(".palette li");
    var globals = $.globals;

    drawRed();
    drawGB();
    renderPalette();

    setColor(rgbToHex(r, g, b));

    if (globals.isTouchDevice){
        pickRed.addEventListener("touchmove", function (event){
            var point = getPoint(event, this);
            pickRedAtPoint(point);
        }, false);

        pickColor.addEventListener("touchmove", function (event){
            var point = getPoint(event, this);
            pickColorAtPoint(point);
        }, false);

        pickColor.addEventListener("touchend", fireChange, false);
    } else {
        pickRed.addEventListener("mousemove", function (event){
            if (globals.mousedown){
                event.preventDefault();
                var point = getPoint(event, this);
                pickRedAtPoint(point);
            }
            event.stopPropagation();
        }, false);

        pickColor.addEventListener("mousemove", function (event){
            if (globals.mousedown){
                event.preventDefault();
                var point = getPoint(event, this);
                pickColorAtPoint(point);
            }
            event.stopPropagation();
        }, false);

        pickColor.addEventListener("mouseup", fireChange, false);
    }

    saveToPaletteLink.addEventListener('click', function (event){
        var hexColor = rgbToHex(r, g, b);
        if (palette.indexOf(hexColor) === -1){
            pushToPalette(hexColor);
        }
    });

    $A(paletteElements).forEach(function (el){
        el.addEventListener('click', function (){
            setColor(this.getAttribute('data-color'));
            fireChange();
        }, false);
    });

    return rgbValue;

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

        for (x=0; x < 256; x+=step) for (y=0; y < 256; y+=step) {
            ctx.fillStyle = 'rgb('+r+','+x+', '+y+')';
            ctx.fillRect(x, y, x + step, y + step);
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
        var s = (r * 65536 + g * 256 + b).toString(16);
        return '#' + pad(s, 6).toUpperCase();

        function pad(s, l){
            if (s.length < l){
                return repeat('0', l - s.length) + s;
            } else return s;
        }

        function repeat(s, n){
            var o = '';
            while (n--) o+= s;
            return o;
        }
    }
}());
