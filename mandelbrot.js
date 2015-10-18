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
      ctx.rect(x,y,3,3);
      ctx.stroke();
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


  function eachColumnPixel(y, pixel) {
    _(_.range(0, canvas.width))
      .each(_.partial(pixel, _, y))
      .value();
  }

  //function eachColumnPixel(y, pixel) {
  //  _(_.range(0, canvas.width))
  //    .each(function(x) { pixel(x,y) })
  //    .value();
  //}



  function eachRow(f){
    if (f >= canvas.height) return;
    eachRow = function (f, x) {
      f(x);
      requestAnimationFrame(function(){ eachRow(f, x + 1) });
    };
    eachRow(f, 0);
  }

  eachRow(function(row) {
    eachColumnPixel(row, function(x,y) {
      //draw(black(pixel(x,y)))
      drawPixel(x,y,0,0,0,1,ctx);
    });
  });
}
