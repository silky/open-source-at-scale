var melody = [ 1, 1, 2, 2, 3/2, 3/2, 3/2, 3/2, 4, 1, 5, 5, 5, 5, 2, 2 ];
var rhythm = [ 2, 4, 2, 4, 30, 2, 20, 10, 2, 4 ];
var xrhythm = [ 8, 16, 1 ];
var phase = [ 0, 1, 0, 4, 0, 3, 1 ];
var d = snare(), e = snare();

return function (t) {
  var m = melody[Math.floor(t * 2) % melody.length];
  var r = rhythm[Math.floor(t * 2) % rhythm.length];
  var q = xrhythm[Math.floor(t * 2) % xrhythm.length];
  var p = t > 24 ? phase[Math.floor(t * r) % phase.length] : 1;
  
  return synth(121*m) * (t > 8)
    + d(t % (1/r/2)) * 0.5 * (t > 4)
    + e(t % (1/q)) * 0.5
  ;
  
  function synth (x) {
    return saw(x) * 0.1
      + saw(x + x/m * p) * 0.25 * (t > 12)
      + sin(x*3 + saw(1/x/10)) * 0.2 * (t > 16)
      + sin(x*4 + x/m * p) * 0.1 * (t > 20)
      + sin(x*5 + 1/2) * 0.05 * (t > 24)
      + saw(x*7 + 1) * 0.1 * (t > 24)
    ;
  }
  function sin (x) { return Math.sin(2 * Math.PI * t * x) }
  function saw (x) { return 1 - t % (1/x) * x * 2 }
}

function snare () {
  var low0 = lowpass(30);
  var low1 = lowpass(80);
  var low2 = lowpass(20);
  return function (t) {
    return low0(snare(80, t))*5
      + low1(snare(40, t+1/60))*10
      + low2(snare(80, t+1/30))*5
    ;
    function snare (n, o) {
      var scalar = Math.max(0, 0.95 - (o * n) / ((o * n) + 1));
      return sin(sin(sin(137)*139)*4217) * scalar;
    }
    function sin (x) { return Math.sin(2 * Math.PI * t * x) }
  };
  function lowpass (n) {
    var value = 0;
    return function (x) { return value += (x - value) / n }
  }
}
