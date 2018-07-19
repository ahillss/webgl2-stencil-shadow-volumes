
var gl;
var canvas;
var mymenu;

var billboardProg,lightProg,ambientProg,shadowEdgeProg,shadowCapProg;


var projMat=mat4.create();
var infProjMat=mat4.create();
var viewMat=mat4.create();
var viewProjMat=mat4.create();
var viewInfProjMat=mat4.create();


var blaMat=mat4.create();
mat4.identity(blaMat);
var billboardMesh;
var scene={};

var teapotMesh;
var teapotShdMesh;
var groundMesh;

var teapotMtrl={"shininess" : 32, "color" : [1.0,1.0,1.0]};
var groundMtrl={"shininess" : 128,  "color" : [1.0,1.0,1.0]};

var getTime=(()=>{var start;return(()=>{start=start||Date.now();return((Date.now()-start)/1000)%3.402823e+38;});})();
var calcFPS=(()=>{var c=0,x=0.0,la=0.0;return(()=>{var cu=Date.now()/1000.0;if(la==0.0){la=cu;}var dt=cu-la;if(dt>=1.0){x=c/dt;c=0;la=cu;}c++;return x;});})();
var fixedTimeStep=(()=>{var st=1.0/30.0,ac;return((cu,A,B)=>{var c=0;ac=ac||cu;while(ac+st<=cu){c+=1;ac+=st;A(st);ac=(c==5)?cu:ac;}B(st,(cu-ac)/st);});})();


var cameraControl=createFreeLookCameraControl5({"pos":[0,8,14],"yaw":0,"pitch":-0.4,"speed":50,"slow":5,"lookSpeed":0.005});


function setErrorMsg(msg) {
    var root=document.getElementById("root");
    root.innerHTML=hasError?root.innerHTML:'';
    hasError=true;
    root.innerHTML+='<pre>'+msg.replace("\n","<br/>");+'</pre>';
}

var addLog=(function(){
    var logElement; return (function(msg){
        logElement=logElement||document.getElementById("log");
        var m=document.createElement('span');
        m.innerHTML=msg.replace("\n","<br/>");
        var e=document.createElement('span');
        logElement.appendChild(document.createElement('br'));
        logElement.appendChild(m);
        logElement.appendChild(e);
        return (function bla(x){e.innerHTML=x.replace("\n","<br/>");return bla});
    });
})();

var updateBarFps=(function(){
    var element; return (function(x){
        element=element||document.getElementById("barFps");
        element.innerHTML = x.toFixed(1)  + " fps";
    });
})();

var updateBarTime=(function(){
    var element; return (function(x){
        element=element||document.getElementById("barTime");
        element.innerHTML = x.toFixed(2);
    });
})();

function calcObjTransform(obj,projMat,infProjMat,viewMat) {
    if(obj.invModelMat) {
        mat4.invert(obj.invModelMat,obj.modelMat); //invModelMat
    }

    if(obj.modelViewMat) {
        mat4.multiply(obj.modelViewMat,viewMat,obj.modelMat); //modelViewMat

        if(obj.normalMat) {
            mat3.normalFromMat4(obj.normalMat,obj.modelViewMat); //normalMat
        }

        if(obj.modelViewProjMat) {
            mat4.multiply(obj.modelViewProjMat,projMat,obj.modelViewMat); //modelViewProjMat
        }

        if(obj.modelViewInfProjMat) {
            mat4.multiply(obj.modelViewInfProjMat,infProjMat,obj.modelViewMat); //modelViewInfProjMat
        }
    }
}

function doMesh(posData,norData,texData,indData) {
    var vertBufs=mygl.createVertBufs(gl,[posData,norData,texData].map(x=>Float32Array.from(x)));
    var indBuf=mygl.createIndBuf(gl,Uint32Array.from(indData));
    var vao=mygl.createVao(gl,[0,1,2],[3,3,2],[gl.FLOAT,gl.FLOAT,gl.FLOAT],vertBufs,indBuf);
    return {"indsNum":indData.length,"vao":vao};
}

function doShadowMesh(verts,inds) {
    var cleanedGeom=cleanVertsInds(verts,inds)
    
    var capGeom=generateCapVertsInds(cleanedGeom.vertices,cleanedGeom.indices);
    var edgeGeom=generateSideVertsInds(cleanedGeom.vertices,cleanedGeom.indices);
    
    var capVertBuf=mygl.createVertBuf(gl,Float32Array.from(capGeom.vertices));
    var edgeVertBuf=mygl.createVertBuf(gl,Float32Array.from(edgeGeom.vertices));

    var capIndBuf=mygl.createIndBuf(gl,Uint32Array.from(capGeom.indices));
    var edgeIndBuf=mygl.createIndBuf(gl,Uint32Array.from(edgeGeom.indices));
    
    var capLineIndBuf=mygl.createIndBuf(gl,Uint32Array.from(capGeom.line_indices));
    var edgeLineIndBuf=mygl.createIndBuf(gl,Uint32Array.from(edgeGeom.line_indices));
    
    var capVao=mygl.createStridedVao(gl,[0,1,2],[3,3,3],[gl.FLOAT,gl.FLOAT,gl.FLOAT],9*4,[0,3,6].map(x=>x*4),capVertBuf,capIndBuf);
    var edgeVao=mygl.createStridedVao(gl,[0,1,2,3],[3,3,3,3],[gl.FLOAT,gl.FLOAT,gl.FLOAT,gl.FLOAT],12*4,[0,3,6,9].map(x=>x*4),edgeVertBuf,edgeIndBuf);
    
    var capLineVao=mygl.createStridedVao(gl,[0,1,2],[3,3,3],[gl.FLOAT,gl.FLOAT,gl.FLOAT],9*4,[0,3,6].map(x=>x*4),capVertBuf,capLineIndBuf);
    var edgeLineVao=mygl.createStridedVao(gl,[0,1,2,3],[3,3,3,3],[gl.FLOAT,gl.FLOAT,gl.FLOAT,gl.FLOAT],12*4,[0,3,6,9].map(x=>x*4),edgeVertBuf,edgeLineIndBuf);
    

    return {
        "capVao":capVao,
        "edgeVao":edgeVao,
        "capLineVao":capLineVao,
        "edgeLineVao":edgeLineVao,
        "capIndsNum":capGeom.indices.length,
        "edgeIndsNum":edgeGeom.indices.length,
        "capLineIndsNum":capGeom.line_indices.length,
        "edgeLineIndsNum":edgeGeom.line_indices.length,
    };
}

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

function createSceneObject() {
    return {
        "modelMat" : mat4.create(),
        "invModelMat" : mat4.create(),
        "modelViewMat" : mat4.create(),
        "normalMat" : mat3.create(),
        "modelViewProjMat" : mat4.create(),
        "modelViewInfProjMat" : mat4.create()
    };
}

function onInit2() {
    //
    scene.ground=createSceneObject();

    scene.teapot=createSceneObject();

    scene.light={
        "modelMat" : mat4.create(),
        "modelViewMat" : mat4.create(),
        "modelViewProjMat" : mat4.create(),
        "pos" : vec4.fromValues(-1,4.5,2,1),
        "viewPos" : vec4.create()
    };

    billboardMesh={"vao":createGeometry([0,2,[-1,-1, 1,-1, -1,1 ,1,1]],null)};

    loadText("models/teapot.obj").then(function(objStr){
        var objMesh = new OBJ.Mesh(objStr);
        var posData=new Float32Array(objMesh.vertices);
        var norData=new Float32Array(objMesh.vertexNormals);
        var texData=new Float32Array(objMesh.textures);
        var indData=new Uint32Array(objMesh.indices);

        teapotMesh=doMesh(posData,norData,texData,indData);
        teapotShdMesh=doShadowMesh(posData,indData);
        gl.bindVertexArray(null);
    },log);

    //
    loadText("models/plane.obj").then(function(objStr){
        var objMesh = new OBJ.Mesh(objStr);
        var posData=new Float32Array(objMesh.vertices);
        var norData=new Float32Array(objMesh.vertexNormals);
        var texData=new Float32Array(objMesh.textures);
        var indData=new Uint32Array(objMesh.indices);
        groundMesh=doMesh(posData,norData,texData,indData);

        gl.bindVertexArray(null);
    },log);


    //

    loadTexture2d(gl,"models/grid.png",gl.RGB, gl.RGB, gl.UNSIGNED_BYTE,false,true,true).then(function(tex) {
        groundMtrl.colTex=tex;
    },log);

    //
    getProgram(gl,"shaders/shdvoledge.vs","shaders/shdvoledge.fs").then(function(prog) {shadowEdgeProg=prog;},log);
    getProgram(gl,"shaders/shdvolcap.vs","shaders/shdvolcap.fs").then(function(prog) {shadowCapProg=prog;},log);

    getProgram(gl,"shaders/light.vs","shaders/light.fs").then(function(prog) {lightProg=prog;},log);
    getProgram(gl,"shaders/billboard.vs","shaders/billboard.fs").then(function(prog) {billboardProg=prog;},log);
    getProgram(gl,"shaders/ambient.vs","shaders/ambient.fs").then(function(prog) {ambientProg=prog;},log);

    //
    mygl.uniform3f(gl,"u_lightAtten",0.9,0.1,0.01);
    mygl.uniform3f(gl,"u_lightCol",1.0,1.0,1.0);
    mygl.uniform3f(gl,"u_ambientCol",0.3,0.3,0.3);
    mygl.uniform1i(gl,"u_colMap",0);
}

function drawObjectLit(obj,mesh,mtrl) {
    if(!mesh || !lightProg) {
        return;
    }

    //


    gl.useProgram(lightProg);

    //
    if(mtrl && mtrl.colTex!=undefined) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, mtrl.colTex);
    }

    //

    gl.bindVertexArray(mesh.vao);

    //

    var col=(mtrl&&mtrl.color)?mtrl.color:[1,1,1];
    var shininess=(mtrl&&mtrl.shininess)?mtrl.shininess:0.5;

    //
    mygl.uniformMatrix4fv(gl,"u_modelMat",false,obj.modelMat);
    mygl.uniformMatrix4fv(gl,"u_modelViewMat",false,obj.modelViewMat);
    mygl.uniformMatrix3fv(gl,"u_normalMat",false,obj.normalMat);
    mygl.uniform1f(gl,"u_shininess",shininess);

    mygl.uniform3fv(gl,"u_materialCol",col);
    mygl.uniform1i(gl,"u_useTexture",(mtrl && mtrl.colTex!=undefined)?1:0);

    //
    mygl.uniformsApply(gl,lightProg);

    //
    gl.drawElements(gl.TRIANGLES, mesh.indsNum, gl.UNSIGNED_INT, 0);


}

function drawObjectAmbientAndDepth(obj,mesh,mtrl) {
    if(!mesh || !ambientProg) {
        return;
    }

    gl.useProgram(ambientProg);

    //
    if(mtrl&&mtrl.colTex!=undefined) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, mtrl.colTex);
    }

    //

    gl.bindVertexArray(mesh.vao);


    var col=(mtrl&&mtrl.color)?mtrl.color:[1,1,1];
    //
    mygl.uniformMatrix4fv(gl,"u_modelMat",false,obj.modelMat);
    mygl.uniform3fv(gl,"u_materialCol",col.map(x=>x*0.6));
    mygl.uniform1i(gl,"u_useTexture",(mtrl && mtrl.colTex!=undefined)?1:0);

    //
    mygl.uniformsApply(gl,ambientProg);

    //
    gl.drawElements(gl.TRIANGLES, mesh.indsNum, gl.UNSIGNED_INT, 0);


}

function drawBillboard(obj) {
    if(!billboardProg) {
        return;
    }

    mygl.uniformMatrix4fv(gl,"u_modelViewProjMat",false,obj.modelViewProjMat);
    mygl.uniformMatrix4fv(gl,"u_modelViewMat",false,obj.modelViewMat);

    gl.useProgram(billboardProg);
    mygl.uniformsApply(gl,billboardProg);



    gl.bindVertexArray(billboardMesh.vao);


    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

}


function onRender(curTime) {
    //

    //projection
    var aspect=canvas.width/canvas.height;
    var zNear=1.0;
    var zFar=100.0;
    var fovy=Math.PI/4.0;

    mat4_perspective_fovy_inf(infProjMat,fovy,aspect,zNear);

    mat4_perspective_fovy(projMat,fovy,aspect,zNear,zFar);

    //
    scene.light.pos[0]=mymenu.lightX;
    scene.light.pos[1]=mymenu.lightY;
    scene.light.pos[2]=mymenu.lightZ;

    mygl.uniform1f(gl,"u_strength",0.25);

    //view
    viewMat=cameraControl.getView();

    //ground
    mat4.identity(scene.ground.modelMat);
    mat4.translate(scene.ground.modelMat,scene.ground.modelMat,vec3.fromValues(0,mymenu.groundY,0));
    mat4.scale(scene.ground.modelMat,scene.ground.modelMat,vec3.fromValues(mymenu.groundScale,mymenu.groundScale,mymenu.groundScale));

    mat4.scale(scene.ground.modelMat,scene.ground.modelMat,vec3.fromValues(8,1,8));


    //teapot
    mat4.identity(scene.teapot.modelMat);
    mat4.translate(scene.teapot.modelMat,scene.teapot.modelMat, vec3.fromValues(0,2,0));
    mat4.scale(scene.teapot.modelMat,scene.teapot.modelMat, vec3.fromValues(1,1,1));

    mat4.multiply(scene.teapot.modelMat,scene.teapot.modelMat,blaMat);
    if(mymenu.sceneAnimate) {
        //~ mat4.rotateY(scene.teapot.modelMat,scene.teapot.modelMat,curTime);
    }
    //mat4.translate(scene.teapot.modelMat,scene.teapot.modelMat, vec3.fromValues(0.5,0,0.5));

    //light
    vec4.transformMat4(scene.light.viewPos,scene.light.pos,viewMat);
    mygl.uniform4fv(gl,"u_lightViewPos",scene.light.viewPos);
    mygl.uniform3fv(gl,"u_lightPos",scene.light.pos.slice(0,3));

    mat4.identity(scene.light.modelMat);
    mat4.translate(scene.light.modelMat,scene.light.modelMat,scene.light.pos);

    //
    calcObjTransform(scene.teapot,projMat,infProjMat,viewMat);
    calcObjTransform(scene.ground,projMat,infProjMat,viewMat);
    calcObjTransform(scene.light,projMat,infProjMat,viewMat);

    mat4.multiply(viewProjMat,projMat,viewMat);
    mat4.multiply(viewInfProjMat,infProjMat,viewMat);


    //
    mygl.uniformMatrix4fv(gl,"u_projMat",false,infProjMat);
    mygl.uniformMatrix4fv(gl,"u_viewProjMat",false,viewInfProjMat);



    mygl.uniform1i(gl,"u_useBack",(mymenu.shadowFace=='back')?1:0);


    //

    mygl.setDrawStates(gl,false,{
        "depth_test":true,
        "color_writemask":[true,true,true,true],
        "depth_writemask":true,
    });

    gl.clearColor(0,0,0,1);
    gl.clearStencil(0);
    //gl.clearColor(0.1,0.1,0.1,1);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
   
    //draw depth and ambient color
    mygl.setDrawStates(gl,true,{
        "cull_face":true,
        "depth_test":true,
    });

    if(mymenu.groundVisible){
        drawObjectAmbientAndDepth(scene.ground,groundMesh,groundMtrl);
    }
    
    drawObjectAmbientAndDepth(scene.teapot,teapotMesh,teapotMtrl);
    
    //render shadow volume stencils
    if(!mymenu.disableShadows) {
    var zfail=mymenu.shadowZ!='pass';
    var backface=mymenu.shadowFace=='back';
    
    mygl.setDrawStates(gl,true,{
        "color_writemask":[false,false,false,false],

        "depth_test":true,
        "depth_writemask":false,
        "depth_func":backface?gl.LEQUAL:gl.LESS,
        
        "polygon_offset_fill":backface?false:true,
        "polygon_offset_factor":0,
        "polygon_offset_units":100,
    
        "stencil_test":true,     
        
        "stencil_func":gl.ALWAYS,
        "stencil_ref":0x0,
        "stencil_valuemask":0xff,
        
        "stencil_fail":gl.KEEP,    
        "stencil_back_pass_depth_pass":zfail?gl.KEEP:gl.DECR_WRAP,
        "stencil_front_pass_depth_pass":zfail?gl.KEEP:gl.INCR_WRAP,    
        "stencil_back_pass_depth_fail":zfail?gl.INCR_WRAP:gl.KEEP,
        "stencil_front_pass_depth_fail":zfail?gl.DECR_WRAP:gl.KEEP,
    });
    
        drawShadow(scene.teapot,teapotShdMesh);
    }

    //render lit objects
    mygl.setDrawStates(gl,true,{
        "stencil_test":true,
        
        "stencil_func":gl.EQUAL,
        "stencil_ref":0x0,
        "stencil_valuemask":0xff,
        
        "stencil_fail":gl.KEEP,
        "stencil_pass_depth_fail":gl.KEEP,
        "stencil_pass_depth_pass":gl.KEEP,
        
        "cull_face":true,
        
        "depth_test":true,
        "depth_writemask":false,
        "depth_func":gl.LEQUAL,
        
        "blend":true,
        "blend_src":gl.ONE,
        "blend_dst":gl.ONE,
    });

    if(mymenu.groundVisible){
        drawObjectLit(scene.ground,groundMesh,groundMtrl);
    }

    drawObjectLit(scene.teapot,teapotMesh,teapotMtrl);

    //render debug shadow volumes
    if(mymenu.shadowDebugVolume) {
        mygl.setDrawStates(gl,true,{
            "depth_test":true,
            "depth_writemask":false,
            "depth_func":gl.LEQUAL,
            
            "blend":true,
            "blend_src":gl.SRC_ALPHA,
            "blend_dst":gl.ONE_MINUS_SRC_ALPHA,
        });

        drawShadow(scene.teapot,teapotShdMesh);
    }
    
    //render debug shadow volumes wireframe
    if(mymenu.shadowDebugWireframe) {
        mygl.setDrawStates(gl,true,{
            "depth_test":true,
            "depth_writemask":false,
            "depth_func":gl.LEQUAL,
            
            "blend":true,
            "blend_src":gl.ONE,
            "blend_dst":gl.ONE,
        });

        drawShadowWireframe(scene.teapot,teapotShdMesh);
    }


    //draw light billboard
    mygl.setDrawStates(gl,true,{
        "cull_face":true,
        "depth_test":true,
        "blend":true,
        "blend_src":gl.SRC_ALPHA,
        "blend_dst":gl.ONE_MINUS_SRC_ALPHA, //gl.ONE
    });
    
    drawBillboard(scene.light);



    updateBarFps(calcFPS());
    updateBarTime(curTime);

}

function log(msg) {
    var textarea = document.getElementById("log");
    textarea.innerHTML += String(msg).replace(/\n/g,"<br />") + "<br />";
}

//~ var getTime=(function(){
//~ var start;
//~ return (()=>{
//~ start=start||Date.now();
//~ return ((Date.now()-start)/1000)%3.402823e+38;
//~ });
//~ })();



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
    onRender(curTime) ;

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

                    //var aaa=mat4.clone(viewMat);
                    ////mat4.copy(aaa,viewMat);
                    //aaa[12]=aaa[13]=aaa[14]=0.0;
                    //mat4.transpose(aaa,aaa);
                    //mat4.rotateY(aaa,aaa,event.movementX*0.01);
                    //mat4.rotateX(aaa,aaa,event.movementY*0.01);

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

function init() {
    

    canvas=document.getElementById("canvas");
    gl=mygl.createContext(canvas,{stencil: true,antialias: true,premultipliedAlpha: false, alpha: false});

    if(!gl) {
        return;
    }

    canvas.onselectstart=null;

    registerInputEvents(canvas);

    onInit2();
    initMenu();

    onAnimate();
}

function drawShadow(obj,mesh) {
    if( !mesh || !shadowCapProg || !shadowEdgeProg) {
        return;
    }

    //
    mygl.uniformMatrix4fv(gl,"u_modelViewMat",false,obj.modelViewMat);
    mygl.uniformMatrix4fv(gl,"u_modelMat",false,obj.modelMat);

    //
    if(mymenu.shadowZ=='fail') {
        gl.bindVertexArray(mesh.capVao);
        gl.useProgram(shadowCapProg);
        mygl.uniformsApply(gl,shadowCapProg);
        gl.drawElements(gl.TRIANGLES, mesh.capIndsNum, gl.UNSIGNED_INT, 0);
    }

    //
    gl.bindVertexArray(mesh.edgeVao);
    gl.useProgram(shadowEdgeProg);
    mygl.uniformsApply(gl,shadowEdgeProg);
    gl.drawElements(gl.TRIANGLES, mesh.edgeIndsNum, gl.UNSIGNED_INT, 0);
}

function drawShadowWireframe(obj,mesh) {
    if( !mesh || !shadowCapProg || !shadowEdgeProg) {
        return;
    }

    //
    mygl.uniformMatrix4fv(gl,"u_modelViewMat",false,obj.modelViewMat);
    mygl.uniformMatrix4fv(gl,"u_modelMat",false,obj.modelMat);

    //
    if(mymenu.shadowZ=='fail') {
        gl.bindVertexArray(mesh.capLineVao);
        gl.useProgram(shadowCapProg);
        mygl.uniformsApply(gl,shadowCapProg);
        gl.drawElements(gl.LINES, mesh.capLineIndsNum, gl.UNSIGNED_INT, 0);
    }

    //
    gl.bindVertexArray(mesh.edgeLineVao);
    gl.useProgram(shadowEdgeProg);
    mygl.uniformsApply(gl,shadowEdgeProg);
    gl.drawElements(gl.LINES, mesh.edgeLineIndsNum, gl.UNSIGNED_INT, 0);
}


window.onload=init;

window.onresize=(function(){window.scrollTo(0,0);});

window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (function(c,e){window.setTimeout(c,1000/60)});

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;
