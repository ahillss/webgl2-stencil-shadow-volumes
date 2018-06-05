# WebGL Stencil Shadow Volumes

[Demo](http://andrewhills.github.io/webgl-stencil-shadow-volumes/demo.html) (requires WebGL2).

Original idea was based off [Mikola Lysneko's implementation](https://github.com/stackgl/webgl-workshop/tree/master/exercises/stencil-shadows).

## Features
* point light
* runs on the gpu instead of cpu
* front and back face extruded shadow volumes
* zpass and zfail
* works on meshes with holes

## Controls

* w/d to move forward/backward
* a/d to strafe
* q/e to move up/down
* mouse click to enable mouse look
* hold down control to rotate the model

## TODO

* add directional light
* simplify caps into single draw call/shader