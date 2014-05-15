var shell = require('gl-now')();
var camera = require('game-shell-orbit-camera')(shell);
var mat4 = require('gl-matrix').mat4;

var extents = [[-5,-5,-5], [5,5,5]];

shell.on('gl-init', function () {
    camera.lookAt(extents[1], [0,0,1], [0, 0, 0.5]);
});

shell.on('gl-render', function() {
    shell.gl.enable(shell.gl.DEPTH_TEST);
    var draw = {
        view: camera.view(),
        projection: mat4.perspective(
            mat4.create(), Math.PI/4,
            shell.width/shell.height, 0.1, 1000
        )
    };
});
