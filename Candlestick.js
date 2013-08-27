/*!
 * CandleStickChart.js
 * Copyright 2013 Ami Heines
 * Released under the WTFPL license
 */
window.Candlestick = function(canvasID, rawData, indicators){
	var chart = this;
  var context = document.getElementById(canvasID).getContext("2d");
	var width = context.canvas.width;
	var height = context.canvas.height;
	//High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
	if (window.devicePixelRatio) {
		context.canvas.style.width = width + "px";
		context.canvas.style.height = height + "px";
		context.canvas.height = height * window.devicePixelRatio;
		context.canvas.width = width * window.devicePixelRatio;
		context.scale(window.devicePixelRatio, window.devicePixelRatio);
	}
  context.translate(0.5, 0.5);
  //////////////////////////////////////////////////////////
  var oCandle = convertYahooFinanceCsvToCandles(rawData);
  var d = oCandle.d
    , o = oCandle.o
    , h = oCandle.h
    , l = oCandle.l
    , c = oCandle.c
    , v = oCandle.v;
  var pixelsPerCandle = 4
    , marginTop = 20
    , marginBottom = 50
    , marginLeft = 10
    , marginRight = 23;
  var hh = Max(h.slice(0,Math.min(h.length, (width-marginLeft-marginRight) / pixelsPerCandle))); // find highest high in candles that will be drawn and add margin
  var ll = Min(l.slice(0,Math.min(l.length, (width-marginLeft-marginRight) / pixelsPerCandle)));
  // improve hh, ll
  var range = hh-ll;
  var step = 1;
  while (range/step > 16){
    if (step<4) {
      step++;
    }else if (step<9){
      step +=2;
    }else if (step<30){
      step +=5;
    }
    //console.log('    step [1] '+step);
  }
  // now that we have the step, find ll and hh which are round and near.
  ll = step * Math.floor(ll/step);
  hh = step * Math.ceil(hh/step);
  ///////////////////////////////////////////////////////
  // calculate the indicators
  // currently only SMA// and EMA
  //console.log('indicators');
  //console.log(indicators);
  var sma = new Array();
  for (var key in indicators){
    var indicator = indicators[key];
    console.log(indicator);
    if (indicator[0]=='SMA'){
      sma.push( SMA(oCandle[indicator[1]], indicator[2]) );
    }
  }
  ///////////////////////////////////////////////////////
  context.fillStyle = "rgb(250,250,200)";//pale yellow
  context.fillRect  (marginLeft,marginTop,width-marginLeft-marginRight,height-marginTop-marginBottom);
  //context.strokeRect(marginLeft,marginTop,width-marginLeft-marginRight,height-marginTop-marginBottom);
  context.strokeRect(0,0,width-1,height-1);// just for fun, frame the whole canvas
  // Y coordinate - prices ticks
  for (var i=ll; i<=hh; i+=step){
    var y0 = scale(ll,hh,height,marginTop,marginBottom, i);
    context.moveTo(marginLeft, y0);
    context.lineTo(width-marginRight, y0);
    context.textBaseline = 'middle';
    context.fillStyle = 'black';
    context.fillText(i, width-marginRight+2, y0);
  }
  context.strokeStyle = 'rgb(200,200,150)';
  context.stroke();
  // X coordinate - month ticks (for weekly charts, for other ranges - TODO)
  context.beginPath();
  var y0 = scale(ll,hh,height, marginTop,marginBottom, ll);
  var y1 = scale(ll,hh,height, marginTop,marginBottom, hh);
  for (var i=0; i<d.length-1 && i<(width-marginLeft-marginRight-pixelsPerCandle)/pixelsPerCandle; i++){
    if (d[i].getMonth()!=d[i+1].getMonth()){
      var x0 = (width-marginRight) - (i+1)*pixelsPerCandle -1;
      context.moveTo(x0, y0);
      context.lineTo(x0, y1);
      mm = ['J','F','M','A','M','J','J','A','S','O','N','D'][d[i].getMonth()];
      if (d[i].getMonth()==0) {
        mm = (''+d[i].getFullYear()).substr(2,2);
      }
      context.textBaseline = 'top';
      var metrics = context.measureText(mm);
      context.fillText(mm, x0-metrics.width/2, y0);
    }
  }
  context.strokeStyle = 'rgb(200,200,150)';
  context.stroke();
  // the SMA array
  for (var j=0; j<sma.length; j++){
    var yPrev = scale(ll,hh,height, marginTop, marginBottom, sma[j][0])
        , x0  = (width-marginRight) - pixelsPerCandle;
    context.beginPath();// the sma line
    context.moveTo(x0 + 1, yPrev);
    for (var i=1; i<c.length && i<(width-marginLeft-marginRight-pixelsPerCandle)/pixelsPerCandle; i++){
      var yCurr = scale(ll,hh,height, marginTop,marginBottom, sma[j][i]);
      x0 = (width-marginRight) - (i+1)*pixelsPerCandle;
      context.lineTo(x0 + 1, yCurr);
    }
    context.strokeStyle = getColor(j);
    context.stroke();
  }
  // the candles themselves
  for (var i=0; i<c.length && i<(width-marginLeft-marginRight-pixelsPerCandle)/pixelsPerCandle; i++){
    var yo = scale(ll,hh,height, marginTop,marginBottom, o[i])
      , yh = scale(ll,hh,height, marginTop,marginBottom, h[i])
      , yl = scale(ll,hh,height, marginTop,marginBottom, l[i])
      , yc = scale(ll,hh,height, marginTop,marginBottom, c[i])
      , x0 = (width-marginRight) - (i+1)*pixelsPerCandle;
    context.beginPath();//body of the candle
    context.moveTo(x0 + 1, Math.min(yo,yc));
    context.lineTo(x0 + 1, Math.max(yo,yc));
    context.strokeStyle = o[i]<c[i] ? 'lightgreen' : 'red';
    if(o[i]>c[i]) {
      context.stroke();
    }

    context.beginPath();
    context.moveTo(x0 + 1, yl);//lower wick
    context.lineTo(x0 + 1, Math.max(yo,yc));
    context.moveTo(x0 + 1, yh);//higher wick
    context.lineTo(x0 + 1, Math.min(yo,yc));
    context.moveTo(x0, yo);//box around the candle's body
    context.lineTo(x0, yc);
    context.lineTo(x0 + 2, yc);
    context.lineTo(x0 + 2, yo);
    context.lineTo(x0, yo);
    context.strokeStyle = 'black';
    context.stroke();
  }
  function scale(ll, hh, height, marginTop, marginBottom, y){
    return marginTop+(height-marginTop-marginBottom)*(1 - (y-ll)/(hh-ll));
  }
  //////////////////////////////////////////////////////////
  function convertYahooFinanceCsvToCandles(rawData) {
    var allTextLines = rawData.split(/\r\n|\n/);
    allTextLines.pop();// remove last element which is empty due to the last /n at the end of the last line
    allTextLines.shift();// remove first line - the headers of the array
    var d=[], o=[], h=[], l=[], c=[], v=[];
    for(var i=0; i<allTextLines.length; i++){
      var entries = allTextLines[i].split(',');
      d.push(new Date(entries[0]));
      var oo = entries[1]
        , hh = entries[2]
        , ll = entries[3]
        , cc = entries[4]
        , vv = entries[5]
        , adjC = entries[6];
      var ratio = adjC / cc;
      o.push(Number((oo*ratio).toFixed(2)));
      h.push(Number((hh*ratio).toFixed(2)));
      l.push(Number((ll*ratio).toFixed(2)));
      c.push(Number((cc*ratio).toFixed(2)));
      v.push(Number((vv/ratio).toFixed(0)));
    }
    return { d:d, o:o, h:h, l:l, c:c, v:v };
  }
	function Max( array ){ return Math.max.apply( Math, array ); }
	function Min( array ){ return Math.min.apply( Math, array ); }
  function SMA( array, smaLength ){
    array.reverse(); // easier on my limited brain to think of the array in the "proper" order
    var sma = new Array();
    for (var i=0; i<smaLength-1; i++){
      sma[i] = NaN;
    }
    sma[smaLength-1] = array.slice(0,smaLength).reduce(function(a, b) { return a + b }) / smaLength;
    for(var i=smaLength; i<array.length; i++){
      sma[i] = sma[i-1] + (array[i] - array[i-smaLength]) / smaLength;
    }
    sma.reverse();// reverse back for main consumption
    array.reverse();// reverse back
    return sma;
  }
  function getColor(j){
    var colors = ['coral','crimson','darkblue','chocolate','chartreuse','blueviolet','darksalmon'];
    return colors[j % colors.length];
  }
}