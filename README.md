# WebGL Stencil Shadow Volumes

[Demo](http://andrewhills.github.io/webgl-stencil-shadow-volumes/demo.html) (requires WebGL2).

Original idea was from [Mikola Lysneko's implementation](https://github.com/stackgl/webgl-workshop/tree/master/exercises/stencil-shadows), and was implemented using the general algorithm described in [GPU Gems 3, chapter 11](https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch11.html).

## Features
* point light
* runs on the gpu instead of cpu
* can do zpass/zfail, back/front faced shadows
* works on meshes with holes

## Controls

* w/d to move forward/backward
* a/d to strafe
* q/e to move up/down
* hold left mouse down to look around, also hold down ctrl while doing this to spin the model

## TODO

* add directional light
* simplify caps into single draw call/shader