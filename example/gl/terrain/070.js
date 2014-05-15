var shell = require('gl-now')();
var camera = require('game-shell-orbit-camera')(shell);
var mat4 = require('gl-matrix').mat4;
var createMesh = require('gl-simplicial-complex');
var polygonize = require('isosurface').surfaceNets;

function f (x,y,z) {
    return Math.sin((3 * x+0.2)*y)
        + Math.sin(x - 2 * y)
        + x*Math.cos(y)/8 - z - 2.0
        + 0.1 * Math.sin(x) * x * 4
    ;
}
var extents = [[-5,-5,-5], [5,5,5]];
var mesh;

shell.on('gl-init', function () {
    camera.lookAt(extents[1], [0,0,1], [0, 0, 0.5]);
    mesh = createMesh(shell.gl, polygonize([64, 64, 64], f, extents));
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
    mesh.draw(draw);
});
