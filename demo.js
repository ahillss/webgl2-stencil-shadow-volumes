
var canvas;
var mymenu;
var teapotMat=mat4.create();
var groundMat=mat4.create();

var blaMat=mat4.create();

//~ var sceneMgr=new Scene();
//~ var xAxisAngle=vec4.create();
//~ var yAxisAngle=vec4.create();


//~ var scene=sceneMgr.identity();

//~ var theThing=sceneMgr.identity();

//~ var blargNode=theThing.axisAngle(xAxisAngle).axisAngle(yAxisAngle).accumulate();

//~ var theMat=blargNode.mat;



var cameraControl=createFreeLookCameraControl5({"pos":[0,8,14],"yaw":0,"pitch":-0.4,"speed":50,"slow":5,"lookSpeed":0.005});


function initMenu() {
    var gui = new dat.GUI();
    mymenu =  {
        "sceneName":'teapot',
        "sceneAnimate":false,

        "shadowFace": 'back',
        "shadowDebugVolume":false,
        "shadowDebugWireframe":false,
        "shadowZ":'fail',
        "cameraYaw":0,
        "cameraPitch":0.5,
        "cameraDist":15,
        "lightX":-1,
        "lightY":6,
        "lightZ":2,
        "groundY":-3,
        "groundScale":1.4,
        "groundVisible":true,
        "disableShadows":false,
    };

    gui.add(mymenu, 'sceneAnimate').name('animate');

    var f1 = gui.addFolder('Shadow');
    f1.add(mymenu, 'shadowFace', ['front', 'back'] ).name('face');
    f1.add(mymenu, 'shadowZ', ['pass', 'fail'] ).name('z');
    f1.add(mymenu, 'shadowDebugVolume').name('show volume');
    f1.add(mymenu, 'shadowDebugWireframe').name('show wireframe');
    f1.add(mymenu, 'disableShadows').name('disable shadows');

    var f3 = gui.addFolder('Light');
    f3.add(mymenu, 'lightX', -5, 5).name('x');
    f3.add(mymenu, 'lightY', 0, 15).name('y');
    f3.add(mymenu, 'lightZ', -5, 5).name('z');

    var f4 = gui.addFolder('Ground');
    f4.add(mymenu, 'groundY',-5,0).name('y');
    f4.add(mymenu, 'groundScale',1,5).name('scale');
    f4.add(mymenu, 'groundVisible').name('visible');

    var f2 = gui.addFolder('Camera');
    f2.add(mymenu, 'cameraYaw', -3.14, 3.14).name('yaw');
    f2.add(mymenu, 'cameraPitch', 0.1, 1.57).name('pitch');
    f2.add(mymenu, 'cameraDist', 2, 55).name('distance');

    f1.open();
    f2.open();
    f3.open();
    f4.open();
}



function calcTransforms() {

    //teapot
    mat4.identity(teapotMat);
    mat4.translate(teapotMat,teapotMat, vec3.fromValues(0,2,0));
    mat4.scale(teapotMat,teapotMat, vec3.fromValues(1,1,1));
    mat4.multiply(teapotMat,teapotMat,blaMat);

    //ground
    mat4.identity(groundMat);
    mat4.translate(groundMat,groundMat,vec3.fromValues(0,mymenu.groundY,0));
    mat4.scale(groundMat,groundMat,vec3.fromValues(mymenu.groundScale,mymenu.groundScale,mymenu.groundScale));

    mat4.scale(groundMat,groundMat,vec3.fromValues(8,1,8));
    
}


function onAnimate() {

    //
    var resScale=1.0;
    var width=Math.floor(canvas.offsetWidth*resScale);
    var height=Math.floor(canvas.offsetHeight*resScale);

    var aspect=width/height;
    var fovy=Math.PI/4;

    cameraControl.update();

    //canvas.width=width;
    //canvas.height=height;

    var curTime=getTime();

    //
    fixedTimeStep(curTime,(dt)=>{
        cameraControl.step(dt);

    },(dt,it)=>{
        cameraControl.render(dt,it);
    });
    
    //
    calcTransforms();
    
    //
    

    var teapotMtrl={"shininess" : 32, "color" : [1.0,1.0,1.0]};
    var groundMtrl={"shininess" : 128,  "color" : [1.0,1.0,1.0]};

    //
    renderer.render({
        "shadowZ":mymenu.shadowZ,
        "shadowFace":mymenu.shadowFace,
        "disableShadows":mymenu.disableShadows,
        "shadowDebugVolume":mymenu.shadowDebugVolume,
        "shadowDebugWireframe":mymenu.shadowDebugWireframe,
    },cameraControl.getView(),[
        {"pos":[mymenu.lightX,mymenu.lightY,mymenu.lightZ,1]},
        {"pos":[-mymenu.lightX,mymenu.lightY,-mymenu.lightZ,1]},
    ],[
        {"mesh":"ground","material":groundMtrl,"modelMat":groundMat},
        {"mesh":"teapot","material":teapotMtrl,"modelMat":teapotMat}
    ]) ;
    

    updateBarFps(calcFPS());
    updateBarTime(curTime);
    

    requestAnimFrame(onAnimate);
}



function registerInputEvents(element) {
    (function(){
        var lmb=false;


        window.addEventListener("keydown", (function(event){
            cameraControl.keydown(event);
            //event.preventDefault();
        }),true);

        document.addEventListener("keyup", (function(event){
            cameraControl.keyup(event);
            // event.preventDefault();
        }),true);

        element.addEventListener('mousemove', function(event) {
            if(PL.isEnabled() || (!PL.isSupported && lmb)) {
                if(!event.ctrlKey) {
                    cameraControl.mousemove(event);
                } else {


                    var viewMat=cameraControl.getView();
                    var aaa=mat4.create();
                    mat4.identity(aaa);
                    mat4.rotate(aaa, aaa, event.movementY*0.01, [viewMat[0],viewMat[4],viewMat[8]])  ;
                    mat4.rotate(aaa, aaa, event.movementX*0.01, [viewMat[1],viewMat[5],viewMat[9]])  ;

                    mat4.multiply(blaMat,aaa,blaMat);
                    


                }
            }


        }, false);

        element.addEventListener("mousedown",function(event){
            if(event.button==0){
                lmb=true;
                if(PL.isEnabled()) {
                    PL.exitPointerLock();
                } else {
                    PL.requestPointerLock(element);
                }
            }
        });

        window.addEventListener("mouseup",function(event){
            if(event.button==0&&lmb){
                lmb=false;
                PL.exitPointerLock();
            }
        });
    })();
}

var renderer;

function onInit() {
    

    canvas=document.getElementById("canvas");


    canvas.onselectstart=null;
    
    renderer=new Renderer(canvas);
    
    
    
    loadText("models/teapot.obj").then(function(objStr){
        var objMesh = new OBJ.Mesh(objStr);
        var posData=new Float32Array(objMesh.vertices);
        var norData=new Float32Array(objMesh.vertexNormals);
        //~ var texData=new Float32Array(objMesh.textures);
        var indData=new Uint32Array(objMesh.indices);

        renderer.addMesh("teapot",posData,norData,indData,true);
    },log);

    //
    loadText("models/plane.obj").then(function(objStr){
        var objMesh = new OBJ.Mesh(objStr);
        var posData=new Float32Array(objMesh.vertices);
        var norData=new Float32Array(objMesh.vertexNormals);
        //~ var texData=new Float32Array(objMesh.textures);
        var indData=new Uint32Array(objMesh.indices);
        
        renderer.addMesh("ground",posData,norData,indData,false);
    },log);


    registerInputEvents(canvas);

    initMenu();

    onAnimate();
}


