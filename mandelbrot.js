function start(canvas) {
  var ctx = canvas.getContext("2d");
  var ctxScale = 1;
  var viewPort = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
  };

  //------------------------------------------------
  // messy canvas crap
  if (window.devicePixelRatio > 1) {
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    canvas.width = canvasWidth * window.devicePixelRatio;
    canvas.height = canvasHeight * window.devicePixelRatio;
    canvas.style.width = canvasWidth;
    canvas.style.height = canvasHeight;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctxScale = window.devicePixelRatio;
  }

  function scalePixel(x, y) {
    return [
      x * ctxScale,
      y * ctxScale
    ];
  }
  //------------------------------------------------
  
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

    //return _.extend({}, viewPort, {
    //  x: viewPort.x + vxy.x - viewPort.width / 2,
    //  y: viewPort.y + vxy.y - viewPort.height / 2
    //});
    return _.extend({}, viewPort, {
      x: vxy.x - viewPort.width / 2,
      y: vxy.y - viewPort.height / 2
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

  function blackPixelColor() {
    return [0,0,0,255];
  }

  function mandelbrotPixelColor (x, y) {
    function mandelbrotRank (x, y, timeout) {
      var i = 0,
        zx = x,
        zy = y;

      while (zx*zx + zy*zy < 4 && i < timeout){
        var tx = zx*zx - zy*zy + x,
          ty = 2*zx*zy + y;

        zx = tx;
        zy = ty;

        i += 1;
      }

      return i;
    }

    var timeout = 10000,
      steps = 23,
      colors = [[0, 0, 0], [255, 255, 255]];

    mandelbrotPixelColor = function(x, y) {
      var vxy = mapIntoViewPort(x, y, viewPort),
        rank = mandelbrotRank(vxy.x, vxy.y, timeout),
        color = [0, 0, 0];

      if (rank < timeout) {
        var colorIndex = Math.floor(rank / steps) % colors.length,
          step = rank % steps,
          div = step / steps;

        color = _.map(color, function(_, i) {
          return colors[colorIndex][i]
            + div * (colors[(colorIndex+1) % colors.length][i] - colors[colorIndex][i]);
        })
      }

      color[3] = 255;

      return color;
    }

    return mandelbrotPixelColor(x, y);
  }

  function eachColumnPixel(y, pixel) {
    _(_.range(0, canvas.width))
      .each(_.partial(pixel, _, y))
      .value();
  }

  // y: row
  // pixelColorFn: (x,y) => [r,g,b,a]
  function renderRow(y, pixelColorFn) {
    var ctxRow = ctx.createImageData(canvas.width, 1),
      ctxRowData = ctxRow.data;

    renderRow = function(y, pixelColorFn) {
      _.times(canvas.width, function(x) {
        _.each(pixelColorFn(x, y), function(v, i) {
          ctxRowData[4 * x + i] = v;
        });
      });
      ctx.putImageData(ctxRow, 0, y);
    };

    renderRow(y, pixelColorFn);

  }

  var row = 0;
  function render() {
    renderRow(row, mandelbrotPixelColor);
    row += 1;
    if (row < canvas.height) {
      requestAnimationFrame(render);
    }
  }

  render();

  viewPort = centerZoom(0.01, centerViewPort(-1, 0, viewPort));

  onClick(function(x, y) {

    var scaled = scalePixel(x, y);
    viewPort = centerZoom (0.2, centerViewPort(scaled[0], scaled[1], viewPort));

    clear();
    row = 0;
    render();

  });
}
