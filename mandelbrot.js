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

    drawPixel.apply(this, arguments);
  }

  function pixel(x, y) {
    return _.partial(drawPixel, x, y);
  }

  function black(f) {
    return _.partial(f, 0, 0, 0, 1);
  }

  function draw(f) {
    return f(ctx);
  }




  draw(black(pixel(10,10)));




}
