var bunny = require('bunny');
var shell = require('mesh-viewer')();

var mesh;
shell.on('viewer-init', function () {
    mesh = shell.createMesh(bunny);
});
