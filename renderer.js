
function doMesh(gl,posData,norData,indData) {
    var vertBufs=[posData,norData].map(x=>mygl.createVertBuf(gl,Float32Array.from(x)));
    var indBuf=mygl.createIndBuf(gl,Uint32Array.from(indData));
    var vao=mygl.createVao(gl,[0,1],[3,3],[gl.FLOAT,gl.FLOAT],[0,0],[0,0],vertBufs,indBuf);
    return {"indsNum":indData.length,"vao":vao};
}

function doShadowMesh(gl,verts,inds) {
    var cleanedGeom=shdvolgeom.clean(verts,inds);
    var capGeom=shdvolgeom.genCaps(cleanedGeom.vertices,cleanedGeom.indices);
    var edgeGeom=shdvolgeom.genEdges(cleanedGeom.vertices,cleanedGeom.indices);
    
    var capVertBuf=mygl.createVertBuf(gl,Float32Array.from(capGeom.vertices));
    var edgeVertBuf=mygl.createVertBuf(gl,Float32Array.from(edgeGeom.vertices));

    var capIndBuf=mygl.createIndBuf(gl,Uint32Array.from(capGeom.indices));
    var edgeIndBuf=mygl.createIndBuf(gl,Uint32Array.from(edgeGeom.indices));   
    var capLineIndBuf=mygl.createIndBuf(gl,Uint32Array.from(capGeom.line_indices));
    var edgeLineIndBuf=mygl.createIndBuf(gl,Uint32Array.from(edgeGeom.line_indices));
 
    var capVao=mygl.createVao(gl,
        [0,1,2],[3,3,3],[gl.FLOAT,gl.FLOAT,gl.FLOAT],
        (new Array(3)).fill(9*4),[0,3,6].map(x=>x*4),
        [capVertBuf,null,null],capIndBuf);

    var edgeVao=mygl.createVao(gl,
        [0,1,2,3],[3,3,3,3],[gl.FLOAT,gl.FLOAT,gl.FLOAT,gl.FLOAT],
        (new Array(4)).fill(12*4),[0,3,6,9].map(x=>x*4),
        [edgeVertBuf,null,null,null],edgeIndBuf);

    var capLineVao=mygl.createVao(gl,
        [0,1,2],[3,3,3],[gl.FLOAT,gl.FLOAT,gl.FLOAT],
        (new Array(3)).fill(9*4),[0,3,6].map(x=>x*4),
        [capVertBuf,null,null],capLineIndBuf);

    var edgeLineVao=mygl.createVao(gl,
        [0,1,2,3],[3,3,3,3],[gl.FLOAT,gl.FLOAT,gl.FLOAT,gl.FLOAT],
        (new Array(4)).fill(12*4),[0,3,6,9].map(x=>x*4),
        [edgeVertBuf,null,null,null],edgeLineIndBuf);
       
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




function drawObjectLit(gl,prog,obj,mesh,mtrl) {
    if(!mesh || !prog) {
        return;
    }

    //


    gl.useProgram(prog);

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
    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_modelMat",false,obj.modelMat);
    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_modelViewMat",false,obj.modelViewMat);
    mygl.setUniform(gl,gl.uniformMatrix3fv,"u_normalMat",false,obj.normalMat);
    mygl.setUniform(gl,gl.uniform1f,"u_shininess",shininess);

    mygl.setUniform(gl,gl.uniform3fv,"u_materialCol",col);
    mygl.setUniform(gl,gl.uniform1i,"u_useTexture",(mtrl && mtrl.colTex!=undefined)?1:0);

    //
    mygl.applyUniforms(gl,prog);

    //
    gl.drawElements(gl.TRIANGLES, mesh.indsNum, gl.UNSIGNED_INT, 0);


}

function drawObjectAmbientAndDepth(gl,prog,obj,mesh,mtrl) {
    if(!mesh || !prog) {
        return;
    }

    gl.useProgram(prog);

    //
    if(mtrl&&mtrl.colTex!=undefined) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, mtrl.colTex);
    }

    //
    gl.bindVertexArray(mesh.vao);

    var col=(mtrl&&mtrl.color)?mtrl.color:[1,1,1];
    //
    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_modelMat",false,obj.modelMat);
    mygl.setUniform(gl,gl.uniform3fv,"u_materialCol",col.map(x=>x*0.6));
    mygl.setUniform(gl,gl.uniform1i,"u_useTexture",(mtrl && mtrl.colTex!=undefined)?1:0);

    //
    mygl.applyUniforms(gl,prog);

    //
    gl.drawElements(gl.TRIANGLES, mesh.indsNum, gl.UNSIGNED_INT, 0);


}

function drawBillboard(gl,prog,billboardMesh,obj) {
    if(!prog) {
        return;
    }

    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_modelViewMat",false,obj.modelViewMat);

    gl.useProgram(prog);
    mygl.applyUniforms(gl,prog);

    gl.bindVertexArray(billboardMesh.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

}


function drawShadow(gl,capProg,edgeProg,obj,mesh,zfail) {
    if( !mesh || !capProg || !edgeProg) {
        return;
    }

    //
    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_modelViewMat",false,obj.modelViewMat);
    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_modelMat",false,obj.modelMat);

    //
    if(zfail) {
        gl.bindVertexArray(mesh.capVao);
        gl.useProgram(capProg);
        mygl.applyUniforms(gl,capProg);
        gl.drawElements(gl.TRIANGLES, mesh.capIndsNum, gl.UNSIGNED_INT, 0);
    }

    //
    gl.bindVertexArray(mesh.edgeVao);
    gl.useProgram(edgeProg);
    mygl.applyUniforms(gl,edgeProg);
    gl.drawElements(gl.TRIANGLES, mesh.edgeIndsNum, gl.UNSIGNED_INT, 0);
}

function drawShadowWireframe(gl,capProg,edgeProg,obj,mesh,zfail) {
    if( !mesh || !capProg || !edgeProg) {
        return;
    }

    //
    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_modelViewMat",false,obj.modelViewMat);
    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_modelMat",false,obj.modelMat);

    //
    if(zfail) {
        gl.bindVertexArray(mesh.capLineVao);
        gl.useProgram(capProg);
        mygl.applyUniforms(gl,capProg);
        gl.drawElements(gl.LINES, mesh.capLineIndsNum, gl.UNSIGNED_INT, 0);
    }

    //
    gl.bindVertexArray(mesh.edgeLineVao);
    gl.useProgram(edgeProg);
    mygl.applyUniforms(gl,edgeProg);
    gl.drawElements(gl.LINES, mesh.edgeLineIndsNum, gl.UNSIGNED_INT, 0);
}


function Renderer(canvas) {
    this.gl=mygl.createContext(canvas,{stencil: true,antialias: true,premultipliedAlpha: false, alpha: false});
    var gl=this.gl;
    
    var billboardVertBuf=mygl.createVertBuf(gl,Float32Array.from([-1,-1, 1,-1, -1,1 ,1,1]));
    var billboardVao=mygl.createVao(gl,[0],[2],[gl.FLOAT],[0],[0],[billboardVertBuf]);
    
    this.billboardMesh={"vao":billboardVao};

    
    
    this.billboardProg=null;
    this.lightProg=null;
    this.ambientProg=null;
    this.shadowEdgeProg=null;
    this.shadowCapProg=null;


    var waa=this;
    
    //

    //loadTexture2d(gl,"models/grid.png",gl.RGB, gl.RGB, gl.UNSIGNED_BYTE,false,true,true).then(function(tex) {
    //    groundMtrl.colTex=tex;
    //},log);

    //
    mygl_old.getProgram(gl,"shaders/shdvoledge.vs","shaders/shdvoledge.fs").then(function(prog) {waa.shadowEdgeProg=prog;},log);
    mygl_old.getProgram(gl,"shaders/shdvolcap.vs","shaders/shdvolcap.fs").then(function(prog) {waa.shadowCapProg=prog;},log);

    mygl_old.getProgram(gl,"shaders/light.vs","shaders/light.fs").then(function(prog) {waa.lightProg=prog;},log);
    mygl_old.getProgram(gl,"shaders/billboard.vs","shaders/billboard.fs").then(function(prog) {waa.billboardProg=prog;},log);
    mygl_old.getProgram(gl,"shaders/ambient.vs","shaders/ambient.fs").then(function(prog) {waa.ambientProg=prog;},log);

    //
    mygl.setUniform(gl,gl.uniform3f,"u_lightAtten",0.9,0.1,0.01);
    mygl.setUniform(gl,gl.uniform3f,"u_lightCol",1.0,1.0,1.0);
    mygl.setUniform(gl,gl.uniform3f,"u_ambientCol",0.5,0.5,0.5);
    mygl.setUniform(gl,gl.uniform1i,"u_colMap",0);
    
    //
    
    this.meshes={};
    this.projMat=mat4.create();
    this.viewProjMat=mat4.create();
}


Renderer.prototype.render = function(options,viewMat,lights,objects) {
    var shadowZFail=options.shadowZ=="fail";
    var shadowBackface=options.shadowFace=='back';

    var gl=this.gl;
    var projMat=this.projMat;

    var viewProjMat=this.viewProjMat;

    //
    var aspect=canvas.width/canvas.height;
    mat4.perspective(this.projMat,Math.PI/4.0,aspect,1);
    
    //
    mat4.multiply(this.viewProjMat,this.projMat,viewMat);
    
    //
    var objects2=new Array(objects.length);
    var lights2=new Array(lights.length);
    
    for(var i=0;i<lights.length;i++) {
        var light=lights[i];
        var light2={}
        lights2[i]=light2;
        
        light2.pos=light.pos;
        light2.viewPos=vec4.create();
        light2.modelViewMat=mat4.create();
        
        var modelMat=mat4.create();
        vec4.transformMat4(light2.viewPos,light2.pos,viewMat);
        
        mat4.identity(modelMat);
        mat4.translate(modelMat,modelMat,light2.pos);        
        mat4.multiply(light2.modelViewMat,viewMat,modelMat);
    }
    
    
    for(var i=0;i<objects.length;i++) {
        var obj=objects[i];
        var obj2={};
        
        objects2[i]=obj2;
        
        obj2.meshName=obj.mesh;
        obj2.modelMat=obj.modelMat;
        obj2.invModelMat=mat4.create();
        obj2.modelViewMat=mat4.create();
        obj2.normalMat=mat3.create();
        obj2.material=obj.material?obj.material:{};
        
        mat4.invert(obj2.invModelMat,obj2.modelMat);
        mat4.multiply(obj2.modelViewMat,viewMat,obj2.modelMat);
        mat3.normalFromMat4(obj2.normalMat,obj2.modelViewMat); 
    }
    
    //
    gl.viewport(0,0,canvas.width,canvas.height);
    
    //light    
    mygl.setUniform(gl,gl.uniform1f,"u_strength",0.25);
    mygl.setUniform(gl,gl.uniform4fv,"u_lightViewPos",lights2[0].viewPos);
    mygl.setUniform(gl,gl.uniform3fv,"u_lightPos",lights2[0].pos.slice(0,3));

    //
    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_projMat",false,projMat);
    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_viewMat",false,viewMat);
    mygl.setUniform(gl,gl.uniformMatrix4fv,"u_viewProjMat",false,viewProjMat);
    
    //
    mygl.setUniform(gl,gl.uniform1i,"u_useBack",shadowBackface?1:0);

    //
    mygl.setDrawStates(gl,false,{
        "depth_test":true,
        "color_writemask":[true,true,true,true],
        "depth_writemask":true,
    });

    gl.clearColor(0,0,0,1);
    gl.clearStencil(0);

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
    
    //draw depth and ambient color
    mygl.setDrawStates(gl,true,{
        "cull_face":true,
        "depth_test":true,
    });   

    for(var k=0;k<objects2.length;k++) {
        var obj=objects2[k];
        var mesh=(obj.meshName in this.meshes)?this.meshes[obj.meshName].mainMesh:null;
        drawObjectAmbientAndDepth(gl,this.ambientProg,obj,mesh,obj.material);
    }
    
    //render shadow volume stencils
    if(!options.disableShadows) {
        
        mygl.setDrawStates(gl,true,{
            "color_writemask":[false,false,false,false],

            "depth_test":true,
            "depth_writemask":false,
            "depth_func":shadowBackface?gl.LEQUAL:gl.LESS,
            
            "polygon_offset_fill":shadowBackface?false:true,
            "polygon_offset_factor":0,
            "polygon_offset_units":100,
            
            "stencil_test":true,     
            
            "stencil_func":gl.ALWAYS,
            "stencil_ref":0x0,
            "stencil_valuemask":0xff,
            
            "stencil_fail":gl.KEEP,    
            "stencil_back_pass_depth_pass":shadowZFail?gl.KEEP:gl.DECR_WRAP,
            "stencil_front_pass_depth_pass":shadowZFail?gl.KEEP:gl.INCR_WRAP,    
            "stencil_back_pass_depth_fail":shadowZFail?gl.INCR_WRAP:gl.KEEP,
            "stencil_front_pass_depth_fail":shadowZFail?gl.DECR_WRAP:gl.KEEP,
        });
        

        for(var k=0;k<objects2.length;k++) {
            var obj=objects2[k];
            var mesh=(obj.meshName in this.meshes)?this.meshes[obj.meshName].shdMesh:null;
            drawShadow(gl,this.shadowCapProg,this.shadowEdgeProg,obj,mesh,shadowZFail);
        }
        
        
    }

    //render lit objects2
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

    for(var k=0;k<objects2.length;k++) {
        var obj=objects2[k];
        var mesh=(obj.meshName in this.meshes)?this.meshes[obj.meshName].mainMesh:null;
        drawObjectLit(gl,this.lightProg,obj,mesh,obj.material);        
    }
    
    //render debug shadow volumes
    if(options.shadowDebugVolume) {
        mygl.setDrawStates(gl,true,{
            "depth_test":true,
            "depth_writemask":false,
            "depth_func":gl.LEQUAL,
            
            "blend":true,
            "blend_src":gl.SRC_ALPHA,
            "blend_dst":gl.ONE_MINUS_SRC_ALPHA,
        });
        
        for(var k=0;k<objects2.length;k++) {
            var obj=objects2[k];
            var mesh=(obj.meshName in this.meshes)?this.meshes[obj.meshName].shdMesh:null;
            drawShadow(gl,this.shadowCapProg,this.shadowEdgeProg,obj,mesh,shadowZFail);
        }
    }
    
    //render debug shadow volumes wireframe
    if(options.shadowDebugWireframe) {
        mygl.setDrawStates(gl,true,{
            "depth_test":true,
            "depth_writemask":false,
            "depth_func":gl.LEQUAL,
            
            "blend":true,
            "blend_src":gl.ONE,
            "blend_dst":gl.ONE,
        });

        for(k in objects2) {
            var obj=objects2[k];
            var mesh=(obj.meshName in this.meshes)?this.meshes[obj.meshName].shdMesh:null;
            drawShadowWireframe(gl,this.shadowCapProg,this.shadowEdgeProg,obj,mesh,shadowZFail);
        }
    }

    //draw light billboard
    mygl.setDrawStates(gl,true,{
        "cull_face":true,
        "depth_test":true,
        "blend":true,
        "blend_src":gl.SRC_ALPHA,
        "blend_dst":gl.ONE_MINUS_SRC_ALPHA, //gl.ONE
    });
    
    drawBillboard(gl,this.billboardProg,this.billboardMesh,lights2[0]);
};

Renderer.prototype.addMesh = function(name,posVerts,norVerts,indices,shadow) {
    var mesh={};
    this.meshes[name]=mesh;
    
    mesh.mainMesh=doMesh(this.gl,posVerts,norVerts,indices);
    
    if(shadow) {
        mesh.shdMesh=doShadowMesh(this.gl,posVerts,indices);
    }
};
