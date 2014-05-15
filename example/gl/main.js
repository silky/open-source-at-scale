//Load shell
var shell = require("gl-now")({ clearColor: [0,0,0,0] });
var camera = require("game-shell-orbit-camera")(shell);
var xtend = require('xtend');

//Mesh creation tools
var createMesh = require("gl-simplicial-complex");
var polygonize = require("isosurface").surfaceNets;
var createAxes = require("gl-axes");

//Matrix math
var mat4 = require("gl-matrix").mat4;

//Bounds on function to plot
var extents = [[-5,-5,-5], [5,5,5]];

function f (x,y,z) {
    return Math.sin((3 * x+0.2)*y)
        + Math.sin(x - 2 * y)
        + x*Math.cos(y)/8 - z - 2.0
        + 0.1 * Math.sin(x) * x * 4
    ;
    //return Math.sin(x*y) + x*Math.cos(y) + z*z - 2.0
}

var search = require('battleship-search');
var domain = [ [ -5, 5 ], [ -5, 5 ] ];

var q = search(domain, function (pt) {
    return f(pt[0], pt[1], 0);
});

q.on('test', function (pt, z) {
    console.log(pt[0], pt[1], z);
    points.push(createPoint(pt[0], pt[1], z));
});

var keycode = require('keycode');
window.addEventListener('keydown', function (ev) {
    var name = keycode(ev);
    if (name === 'space') q.next();
});

var mesh, axes;

shell.on("gl-init", function () {
    var gl = shell.gl;
    camera.lookAt(extents[1], [0,0,0], [0, 1, 0]);
    axes = createAxes(gl, { extents: extents });
    mesh = createMesh(gl, polygonize([64, 64, 64], f, extents));
});

function createPoint (x_, y_, z_) {
    var gl = shell.gl;
    return createMesh(gl, polygonize([64, 64, 64], f, extents));
    function f (x, y, z) {
        x -= x_, y -= y_, z -= z_;
        var r = 1/8;
        return x*x + y*y + z*z - r*r;
    }
}

var points = [];

shell.on("gl-render", function() {
    var gl = shell.gl
    gl.enable(gl.DEPTH_TEST);
    
    var cameraParameters = {
        view: camera.view(),
        projection: mat4.perspective(
            mat4.create(),
            Math.PI/4.0,
            shell.width/shell.height,
            0.1,
            1000.0
        )
    };
    
    mesh.draw(cameraParameters);
    axes.draw(cameraParameters);
    
    for (var i = 0; i < points.length; i++) {
        points[i].draw(xtend(cameraParameters, {
            ambient: [ 1, 0, 0 ],
            diffuse: [ 1, 0, 0 ]
        }));
    }
});
