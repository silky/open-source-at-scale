var shell = require('gl-now')();
var camera = require('game-shell-orbit-camera')(shell);

var extents = [[-5,-5,-5], [5,5,5]];

shell.on('gl-init', function () {
    camera.lookAt(extents[1], [0,0,1], [0, 0, 0.5]);
});

shell.on('gl-render', function() {
    shell.gl.enable(shell.gl.DEPTH_TEST);
});
