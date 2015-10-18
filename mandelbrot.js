function start(canvas) {
  var ctx = canvas.getContext("2d");

  // messy canvas crap
  if (window.devicePixelRatio > 1) {
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    canvas.width = canvasWidth * window.devicePixelRatio;
    canvas.height = canvasHeight * window.devicePixelRatio;
    canvas.style.width = canvasWidth;
    canvas.style.height = canvasHeight;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function getCursorPosition(canvas, event) {
    canoffset = $(canvas).offset();
    return {
      x: event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left),
      y: event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1
    };
  }

  function onClick (f) {
    $(canvas).on('click', function(event) {
      var pos = getCursorPosition(canvas, event);
      f(pos.x, pos.y);
    });
  }

  // a lazy function definition that initializes the constants
  // on the first call to this function.  subsequent calls will
  // have the two variables in the scope.
  function drawPixel(x, y, r, g, b, a, ctx) {
    var drawPixelId = ctx.createImageData(1,1);
    var drawPixelData  = drawPixelId.data;

    drawPixel = function(x, y, r, g, b, a, ctx) {
      drawPixelData[0] = r;
      drawPixelData[1] = g;
      drawPixelData[2] = b;
      drawPixelData[3] = a;
      ctx.putImageData(drawPixelId, x, y);
    };
  }

  function pixel(x, y) {
    return _.partial(drawPixel, x, y);
  }

  function black(f) {
    return _.partial(f, 0, 0, 0, 255);
  }

  function draw(f) {
    return f(ctx);
  }


  function eachColumnPixel(y, pixel) {
    _(_.range(0, canvas.width))
      .each(_.partial(pixel, _, y))
      .value();
  }

  function eachRow(f){
    var r = function (f, x) {
      if (x >= canvas.height) return;
      
      f(x);

      requestAnimationFrame(function(){ r(f, x + 1) });
      //setTimeout(function(){ eachRow(f, x + 1) },0);
    };
    r(f, 0);
  }

  function mandelbrotRank (x, y, timeout) {
    var i = 0,
      zx = x,
      zy = y;

    while (zx*zx + zy*zy < 4 && i < timeout){
      zx = zx*zx - zy*zy + x + offx;
      zy = 2*zx*zy + y + offy;
      i += 1;
    }

    return i;
  }

  //eachRow(function(row) {
  //  eachColumnPixel(row, function(x,y) {
  //    draw(black(pixel(x,y)))
  //  });
  //});

  eachRow(function(row) {
    eachColumnPixel(row, function(x,y) {
      //draw(black(pixel(x,y)))

    });
  });


}
