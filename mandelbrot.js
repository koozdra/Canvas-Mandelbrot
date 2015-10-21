function start(canvas) {
  var ctx = canvas.getContext("2d");
  var viewPort = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
  };

  function clear() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  function mapIntoViewPort(x, y, viewPort) {
    return {
      x: viewPort.x + x * (viewPort.width / canvas.width),
      y: viewPort.y + y * (viewPort.height / canvas.height)
    }
  }

  function scaleViewPort (s, viewPort) {
    return _.extend({}, viewPort, {
      width: viewPort.width * s,
      height: viewPort.height * s
    });
  }

  function shiftViewPort (dx, dy, viewPort) {
    return _.extend({}, viewPort, {
      x: viewPort.x + dx,
      y: viewPort.y + dy
    });
  }

  function centerZoom(s, viewPort) {
    return shiftViewPort(
      (viewPort.width - (viewPort.width * s)) / 2,
      (viewPort.height - (viewPort.height * s)) / 2,
      scaleViewPort (s, viewPort)
    );
  }

  // creates a copy of a viewPort centered at x,y
  function centerViewPort(x, y, viewPort) {
    var vxy = mapIntoViewPort(x, y, viewPort);

    return _.extend({}, viewPort, {
      x: viewPort.x + vxy.x - viewPort.width / 2,
      y: viewPort.y + vxy.y - viewPort.height / 2
    });
  }

  // creates a copy of a viewPort centered at x,y
  // and decreased in size by
  function zoomViewPort(x, y, factor, viewPort) {
    // incomplete...
    return _.extend({}, viewPort, {
      width: viewPort.width * factor,
      height: viewPort.height * factor
    });
  }

  function drawViewPort(viewPort) {
    ctx.rect(viewPort.x, viewPort.y, viewPort.width, viewPort.height);
    ctx.stroke();
  }

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

  function white(f) {
    return _.partial(f, 255, 255, 255, 255);
  }

  function colored(f, r, g, b) {
    return _.partial(f, r, g, b, 255);
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
      var tx = zx*zx - zy*zy + x;
      var ty = 2*zx*zy + y;

      zx = tx;
      zy = ty;

      i += 1;
    }

    return i;
  }

  //eachRow(function(row) {
  //  eachColumnPixel(row, function(x,y) {
  //    draw(black(pixel(x,y)))
  //  });
  //});
  //
  //eachRow(function(row) {
  //  eachColumnPixel(row, function(x,y) {
  //    draw(black(pixel(x,y)))
  //
  //  });
  //});

  //onClick(function(x, y) {
  //  zoomViewPort(x, y, 0.5, );
  //})




  function renderRow(row) {

    var colors = [[0, 0, 0], [255, 255, 255]];

    //eachRow(function (row) {
      eachColumnPixel(row, function (x, y) {
        var timeout = 10000;
        var steps = 23;
        var vxy = mapIntoViewPort(x, y, viewPort)
        var rank = mandelbrotRank(vxy.x, vxy.y, timeout);

        var p = pixel(x, y);

        if (rank < timeout) {
          var colorIndex = Math.floor(rank / steps) % colors.length;
          var step = rank % steps;
          var i = step / steps;

          draw(colored(pixel(x,y),
            colors[colorIndex][0] + (colors[(colorIndex+1) % colors.length][0] - colors[colorIndex][0]) * i,
            colors[colorIndex][1] + (colors[(colorIndex+1) % colors.length][1] - colors[colorIndex][1]) * i,
            colors[colorIndex][2] + (colors[(colorIndex+1) % colors.length][2] - colors[colorIndex][2]) * i
          ));
        }
        else {


          draw(black(pixel(x, y)))
        }
      });
    //});
  }


  var row = 0;
  function render() {
    renderRow(row);
    row += 1;
    if (row < canvas.height) {
      requestAnimationFrame(render);
    }
  }

  render();

  viewPort = centerZoom(0.01, centerViewPort(-1, 0, viewPort));

  onClick(function(x, y) {
    clear();
    row = 0;
    var vxy = mapIntoViewPort(x, y, viewPort);

    viewPort = _.extend({}, viewPort, {
      x: vxy.x - (viewPort.width / 2) + (vxy.x - viewPort.x),
      y: vxy.y - (viewPort.height / 2) + (vxy.y - viewPort.y)
    });

    viewPort = centerZoom (0.1, viewPort);

    render();
  });


  //function iterate(fn,wh) {
  //  var halted = false;
  //
  //  function halt(){
  //    halted = true;
  //  }
  //
  //  var f = function() {
  //    fn();
  //    if (!halted && !wh(halt)) requestAnimationFrame(f);
  //  }
  //
  //  f();
  //}
  //
  //var row = 0;
  //
  //iterate(function() {
  //  render(row);
  //  row += 1;
  //}, function(haltFn) {
  //  if (row >= canvas.height) haltFn();
  //});
  //
  //
  //
  //iterate(function() {
  //  // draw row
  //}, function(haltFn) {
  //  // halt if end of screen reached
  //
  //  // continue iteration
  //});
  //
  //iterate(function(haltFn, y){
  //
  //})
  //
  //
  ////iterate(action, whileCondition(halt:Function))
  //
  //var animation = animate(function() {
  //  console.log('yes');
  //});
  //setTimeout(function() {
  //  animation.halt();
  //}, 1000);



}
