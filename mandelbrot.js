function start(canvas) {
  var ctx = canvas.getContext("2d");


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
    eachRow = function (f, x) {
      if (x >= canvas.height) return;
      
      f(x);
      
      //requestAnimationFrame(function(){ eachRow(f, x + 1) });
      setTimeout(function(){ eachRow(f, x + 1) },0);
    };
    eachRow(f, 0);
  }

  eachRow(function(row) {
    eachColumnPixel(row, function(x,y) {
      draw(black(pixel(x,y)))
    });
  });
}
