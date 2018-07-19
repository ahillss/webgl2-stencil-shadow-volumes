var mygl=mygl||{};

//

mygl.createContext=(canvas,params,onError)=>{
    onError=onError||console.log;

    canvas.addEventListener("webglcontextcreationerror",(event)=>{
        onError(String(event.statusMessage).replace(new RegExp('[,.]', 'g'),'\n'));
    }, false);

    canvas.addEventListener('webglcontextlost',(event)=>{
        onError("WebGL2 context lost.\n");
    }, false);

    try {
        return canvas.getContext("webgl2",params);
    } catch(ex) { }

    onError("Could not initialise WebGL.");
    return null;
}

//

mygl.syncDrawStates=(gl)=>{
    gl.myDrawStates=gl.myDrawStates||{};

    gl.myDrawStates["cull_face"]=gl.getParameter(gl.CULL_FACE);
    gl.myDrawStates["blend"]=gl.getParameter(gl.BLEND);
    gl.myDrawStates["stencil_test"]=gl.getParameter(gl.STENCIL_TEST);
    gl.myDrawStates["depth_test"]=gl.getParameter(gl.DEPTH_TEST);
    gl.myDrawStates["polygon_offset_fill"]=gl.getParameter(gl.POLYGON_OFFSET_FILL);

    gl.myDrawStates["dither"]=gl.getParameter(gl.DITHER);
    gl.myDrawStates["scissor_test"]=gl.getParameter(gl.SCISSOR_TEST);

    //
    gl.myDrawStates["blend_color"]=gl.getParameter(gl.BLEND_COLOR);

    //blend equation
    gl.myDrawStates["blend_equation_rgb"]=gl.getParameter(gl.BLEND_EQUATION_RGB);
    gl.myDrawStates["blend_equation_alpha"]=gl.getParameter(gl.BLEND_EQUATION_ALPHA);

    //blend func
    gl.myDrawStates["blend_src_rgb"]=gl.getParameter(gl.BLEND_SRC_RGB);
    gl.myDrawStates["blend_dst_rgb"]=gl.getParameter(gl.BLEND_DST_RGB);
    gl.myDrawStates["blend_src_alpha"]=gl.getParameter(gl.BLEND_SRC_ALPHA);
    gl.myDrawStates["blend_dst_alpha"]=gl.getParameter(gl.BLEND_DST_ALPHA);

    //
    gl.myDrawStates["color_writemask"]=gl.getParameter(gl.COLOR_WRITEMASK);
    gl.myDrawStates["cull_face_mode"]=gl.getParameter(gl.CULL_FACE_MODE);
    gl.myDrawStates["depth_func"]=gl.getParameter(gl.DEPTH_FUNC);
    gl.myDrawStates["depth_writemask"]=gl.getParameter(gl.DEPTH_WRITEMASK);

    var depthRange=gl.getParameter(gl.DEPTH_RANGE);
    gl.myDrawStates["depth_range"][0]=depthRange[0];
    gl.myDrawStates["depth_range"][1]=depthRange[1];

    gl.myDrawStates["front_face"]=gl.getParameter(gl.FRONT_FACE);

    //polygonOffset
    gl.myDrawStates["polygon_offset_factor"]=gl.getParameter(gl.POLYGON_OFFSET_FACTOR);
    gl.myDrawStates["polygon_offset_units"]=gl.getParameter(gl.POLYGON_OFFSET_UNITS);

    //stencilFuncBack
    gl.myDrawStates["stencil_back_func"]=gl.getParameter(gl.STENCIL_BACK_FUNC);
    gl.myDrawStates["stencil_back_ref"]=gl.getParameter(gl.STENCIL_BACK_REF);
    gl.myDrawStates["stencil_back_valuemask"]=gl.getParameter(gl.STENCIL_BACK_VALUE_MASK);

    //stencilFuncFront
    gl.myDrawStates["stencil_front_func"]=gl.getParameter(gl.STENCIL_FUNC);
    gl.myDrawStates["stencil_front_ref"]=gl.getParameter(gl.STENCIL_REF);
    gl.myDrawStates["stencil_front_valuemask"]=gl.getParameter(gl.STENCIL_VALUE_MASK);

    //stencilMaskBack
    gl.myDrawStates["stencil_back_writemask"]=gl.getParameter(gl.STENCIL_BACK_WRITEMASK);

    //stencilMaskFront
    gl.myDrawStates["stencil_front_writemask"]=gl.getParameter(gl.STENCIL_WRITEMASK);

    //stencilOpBack
    gl.myDrawStates["stencil_back_pass_depth_fail"]=gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_FAIL);
    gl.myDrawStates["stencil_back_pass_depth_pass"]=gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_PASS);
    gl.myDrawStates["stencil_back_fail"]=gl.getParameter(gl.STENCIL_BACK_FAIL);

    //stencilOpFront
    gl.myDrawStates["stencil_front_pass_depth_fail"]=gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
    gl.myDrawStates["stencil_front_pass_depth_pass"]=gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);
    gl.myDrawStates["stencil_front_fail"]=gl.getParameter(gl.STENCIL_FAIL);

    //scissor
    gl.myDrawStates["scissor_box"]=gl.getParameter(gl.SCISSOR_BOX);

    //lineWidth
    gl.myDrawStates["line_width"]=gl.getParameter(gl.LINE_WIDTH);
}

(()=>{
    function setToState(gl,toStates,inputStates,clear,stateName,altStateName,defaultVal) {
        if(inputStates[stateName]!=undefined) {
            toStates[stateName]=inputStates[stateName];
        } else if(altStateName!==false && inputStates[altStateName]!=undefined) {
            toStates[stateName]=inputStates[altStateName];
        } else if(!clear && gl.myDrawStates[stateName]!=undefined){
            toStates[stateName]=gl.myDrawStates[stateName];
        } else {
            toStates[stateName]=defaultVal;
        }
    }

    function setBoolState(gl,toStates,enumVal,stateName) {
        if(toStates[stateName]!=gl.myDrawStates[stateName]) {
            gl.myDrawStates[stateName]=toStates[stateName];
            if(toStates[stateName]) {
                gl.enable(enumVal);
            } else {
                gl.disable(enumVal);
            }
        }
    }

    function setArrayState(gl,toStates,func,stateName,required) {
        if(required!==false && toStates[required]===false) {
            return;
        }

        var update=false;

        if(gl.myDrawStates[stateName]==undefined) {
            update=true;
        } else {
            for(var i=0;i<toStates[stateName].length;i++) {
                if(gl.myDrawStates[stateName][i]!=toStates[stateName][i]) {
                    update=true;
                    break;
                }
            }
        }

        if(!update) {
            return;
        }


        gl.myDrawStates[stateName]=toStates[stateName].slice();

        func.apply(gl,toStates[stateName]);
    }

    function setParamState(gl,toStates,func,stateNames,pre,required) {
        if(required!==false && toStates[required]===false) {
            return;
        }

        var update=false;

        for(var i=0;i<stateNames.length;i++) {
            var stateName=stateNames[i];

            if(gl.myDrawStates[stateName] != toStates[stateName]) {
                update=true;
                break;
            }
        }

        if(!update) {
            return;
        }

        for(var i=0;i<stateNames.length;i++) {
            gl.myDrawStates[stateNames[i]] = toStates[stateNames[i]];
        }

        var params=stateNames.map(x => toStates[x]);

        if(pre!==false) {
            params.unshift(pre);
        }

        func.apply(gl,params);
    }
        
    mygl.setDrawStates=(gl,clear,inputStates)=>{
        gl.myDrawStates=gl.myDrawStates||{};
        var toStates={};

        //set values to update with
        setToState(gl,toStates,inputStates,clear,"blend",false,false);
        setToState(gl,toStates,inputStates,clear,"blend_color",false,[0,0,0,0]);
        setToState(gl,toStates,inputStates,clear,"blend_equation_rgb","blend_equation",gl.FUNC_ADD);
        setToState(gl,toStates,inputStates,clear,"blend_equation_alpha","blend_equation",gl.FUNC_ADD);
        setToState(gl,toStates,inputStates,clear,"blend_src_rgb","blend_src",gl.ONE);
        setToState(gl,toStates,inputStates,clear,"blend_src_alpha","blend_src",gl.ONE);
        setToState(gl,toStates,inputStates,clear,"blend_dst_rgb","blend_dst",gl.ZERO);
        setToState(gl,toStates,inputStates,clear,"blend_dst_alpha","blend_dst",gl.ZERO);

        setToState(gl,toStates,inputStates,clear,"cull_face",false,false);
        setToState(gl,toStates,inputStates,clear,"cull_face_mode",false,gl.BACK);
        setToState(gl,toStates,inputStates,clear,"front_face",false,gl.CCW);

        setToState(gl,toStates,inputStates,clear,"depth_test",false,false);
        setToState(gl,toStates,inputStates,clear,"depth_func",false,gl.LESS);
        setToState(gl,toStates,inputStates,clear,"depth_writemask",false,true);
        setToState(gl,toStates,inputStates,clear,"depth_range",false,[0,1]);

        setToState(gl,toStates,inputStates,clear,"polygon_offset_fill",false,false);
        setToState(gl,toStates,inputStates,clear,"polygon_offset_factor",false,0);
        setToState(gl,toStates,inputStates,clear,"polygon_offset_units",false,0);

        setToState(gl,toStates,inputStates,clear,"stencil_test",false,false);
        setToState(gl,toStates,inputStates,clear,"stencil_back_func","stencil_func",gl.ALWAYS);
        setToState(gl,toStates,inputStates,clear,"stencil_back_ref","stencil_ref",0);
        setToState(gl,toStates,inputStates,clear,"stencil_back_valuemask","stencil_valuemask",0xffffffff);
        setToState(gl,toStates,inputStates,clear,"stencil_back_writemask","stencil_writemask",0xffffffff);
        setToState(gl,toStates,inputStates,clear,"stencil_back_pass_depth_fail","stencil_pass_depth_fail",gl.KEEP);
        setToState(gl,toStates,inputStates,clear,"stencil_back_pass_depth_pass","stencil_pass_depth_pass",gl.KEEP);
        setToState(gl,toStates,inputStates,clear,"stencil_back_fail","stencil_fail",gl.KEEP);
        setToState(gl,toStates,inputStates,clear,"stencil_front_func","stencil_func",gl.ALWAYS);
        setToState(gl,toStates,inputStates,clear,"stencil_front_ref","stencil_ref",0);
        setToState(gl,toStates,inputStates,clear,"stencil_front_valuemask","stencil_valuemask",0xffffffff);
        setToState(gl,toStates,inputStates,clear,"stencil_front_writemask","stencil_writemask",0xffffffff);
        setToState(gl,toStates,inputStates,clear,"stencil_front_pass_depth_fail","stencil_pass_depth_fail",gl.KEEP);
        setToState(gl,toStates,inputStates,clear,"stencil_front_pass_depth_pass","stencil_pass_depth_pass",gl.KEEP);
        setToState(gl,toStates,inputStates,clear,"stencil_front_fail","stencil_fail",gl.KEEP);

        setToState(gl,toStates,inputStates,clear,"scissor_test",false,false);
        setToState(gl,toStates,inputStates,clear,"scissor_box",false,[0,0,0,0]);

        setToState(gl,toStates,inputStates,clear,"dither",false,true);
        setToState(gl,toStates,inputStates,clear,"color_writemask",false,[true,true,true,true]);
        setToState(gl,toStates,inputStates,clear,"line_width",false,1);

        //set gl states
        setBoolState(gl,toStates,gl.DEPTH_TEST,"depth_test");
        setParamState(gl,toStates,gl.depthFunc,["depth_func"],false,"depth_test");
        setParamState(gl,toStates,gl.depthMask,["depth_writemask"],false,"depth_test");
        setArrayState(gl,toStates,gl.depthRange,"depth_range","depth_test");

        setBoolState(gl,toStates,gl.BLEND,"blend");
        setArrayState(gl,toStates,gl.blendColor,"blend_color","blend");
        setParamState(gl,toStates,gl.blendEquationSeparate,["blend_equation_rgb","blend_equation_alpha"],false,"blend");
        setParamState(gl,toStates,gl.blendFuncSeparate,["blend_src_rgb","blend_dst_rgb","blend_src_alpha","blend_dst_alpha"],false,"blend");

        setBoolState(gl,toStates,gl.STENCIL_TEST,"stencil_test");
        setParamState(gl,toStates,gl.stencilFuncSeparate,["stencil_front_func","stencil_front_ref","stencil_front_valuemask"],gl.FRONT,"stencil_test");
        setParamState(gl,toStates,gl.stencilFuncSeparate,["stencil_back_func","stencil_back_ref","stencil_back_valuemask"],gl.BACK,"stencil_test");
        setParamState(gl,toStates,gl.stencilMaskSeparate,["stencil_front_writemask"],gl.FRONT,"stencil_test");
        setParamState(gl,toStates,gl.stencilMaskSeparate,["stencil_back_writemask"],gl.BACK,"stencil_test");
        setParamState(gl,toStates,gl.stencilOpSeparate,["stencil_front_fail","stencil_front_pass_depth_fail","stencil_front_pass_depth_pass"],gl.FRONT,"stencil_test");
        setParamState(gl,toStates,gl.stencilOpSeparate,["stencil_back_fail","stencil_back_pass_depth_fail","stencil_back_pass_depth_pass"],gl.BACK,"stencil_test");

        setBoolState(gl,toStates,gl.CULL_FACE,"cull_face");
        setParamState(gl,toStates,gl.cullFace,["cull_face_mode"],false,"cull_face");
        setParamState(gl,toStates,gl.frontFace,["front_face"],false,false);

        setBoolState(gl,toStates,gl.POLYGON_OFFSET_FILL,"polygon_offset_fill");
        setParamState(gl,toStates,gl.polygonOffset,["polygon_offset_factor","polygon_offset_units"],false,"polygon_offset_fill");

        setBoolState(gl,toStates,gl.SCISSOR_TEST,"scissor_test");
        setArrayState(gl,toStates,gl.scissor,"scissor_box","scissor_test");

        setBoolState(gl,toStates,gl.DITHER,"dither");
        setArrayState(gl,toStates,gl.colorMask,"color_writemask",false);
        setParamState(gl,toStates,gl.lineWidth,["line_width"],false,false);
    }
})();


//

mygl.uniform1i=(gl,n,v0)=>{
    gl.myUniforms=gl.myUniforms||[{}];
    gl.myUniforms[gl.myUniforms.length-1][n]={"func":(function(loc){gl.uniform1i(loc,v0);}),"id":{"type":"1i","value":v0}};
}

mygl.uniform1f=(gl,n,v0)=>{
    gl.myUniforms=gl.myUniforms||[{}];
    gl.myUniforms[gl.myUniforms.length-1][n]={"func":(function(loc){gl.uniform1f(loc,v0);}),"id":{}};
}

mygl.uniform2f=(gl,n,v0,v1)=>{
    gl.myUniforms=gl.myUniforms||[{}];
    gl.myUniforms[gl.myUniforms.length-1][n]={"func":(function(loc){gl.uniform2f(loc,v0,v1);}),"id":{}};
}

mygl.uniform3f=(gl,n,v0,v1,v2)=>{
    gl.myUniforms=gl.myUniforms||[{}];
    gl.myUniforms[gl.myUniforms.length-1][n]={"func":(function(loc){gl.uniform3f(loc,v0,v1,v2);}),"id":{}};
}

mygl.uniform4f=(gl,n,v0,v1,v2,v3)=>{
    gl.myUniforms=gl.myUniforms||[{}];
    gl.myUniforms[gl.myUniforms.length-1][n]={"func":(function(loc){gl.uniform4f(loc,v0,v1,v2,v3);}),"id":{}};
}

mygl.uniform2fv=(gl,n,v)=>{
    v=new Float32Array(v);
    gl.myUniforms=gl.myUniforms||[{}];
    gl.myUniforms[gl.myUniforms.length-1][n]={"func":(function(loc){gl.uniform2fv(loc,v);}),"id":{}};
}

mygl.uniform3fv=(gl,n,v)=>{
    v=new Float32Array(v);
    gl.myUniforms=gl.myUniforms||[{}];
    gl.myUniforms[gl.myUniforms.length-1][n]={"func":(function(loc){gl.uniform3fv(loc,v);}),"id":{}};
}

mygl.uniform4fv=(gl,n,v)=>{
    v=new Float32Array(v);
    gl.myUniforms=gl.myUniforms||[{}];
    gl.myUniforms[gl.myUniforms.length-1][n]={"func":(function(loc){gl.uniform4fv(loc,v);}),"id":{}};
}

mygl.uniformMatrix3fv=(gl,n,t,v)=>{
    v=new Float32Array(v);
    gl.myUniforms=gl.myUniforms||[{}];
    gl.myUniforms[gl.myUniforms.length-1][n]={"func":(function(loc){gl.uniformMatrix3fv(loc,t,v);}),"id":{}};
}

mygl.uniformMatrix4fv=(gl,n,t,v)=>{
    v=new Float32Array(v);
    gl.myUniforms=gl.myUniforms||[{}];
    gl.myUniforms[gl.myUniforms.length-1][n]={"func":(function(loc){gl.uniformMatrix4fv(loc,t,v);}),"id":{}};
}

mygl.uniformsPush=(gl)=>{
    gl.myUniforms=gl.myUniforms||[{}];
    var prev=gl.myUniforms[gl.myUniforms.length-1];
    var vals={};
    gl.myUniforms.push(vals);

    for(k in prev) {
        vals[k]=prev[k];
    }
}

mygl.uniformsPop=(gl)=>{
    gl.myUniforms=gl.myUniforms||[{}];
    if(gl.myUniforms.length>1) {
        gl.myUniforms.pop();
    }
}

mygl.uniformsApply=(gl,prog)=>{
    gl.myUniforms=gl.myUniforms||[{}];
    prog.myUniforms=prog.myUniforms||{};

    var gVals=gl.myUniforms[gl.myUniforms.length-1];

    for(var k in gVals) {
        prog.myUniforms[k]=prog.myUniforms[k]||{"loc" : gl.getUniformLocation(prog,k), "id" : null};
        var pVal=prog.myUniforms[k];
        var gVal=gVals[k];
        var pId=pVal["id"];
        var gId=gVal["id"];

        if(pVal["loc"] && (!pId || pId["type"]!="1i" || gId["type"]!="1i" || pId["value"]!=gId["value"]) && pId!=gId) {
            gVal["func"](pVal["loc"]);
            pVal["id"]=gId;
        }
    }
}

mygl.createVertBuf=(gl,data)=>{
    var buf=gl.createBuffer();
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);
    return buf;
}

mygl.createVertBufs=(gl,datas)=>{
    return datas.map(data => mygl.createVertBuf(gl,data));
}

mygl.createIndBuf=(gl,data)=>{
    var buf=gl.createBuffer();
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,data,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    return buf;
}

mygl.createVao=(gl,locs,sizes,types,vertBufs,indBuf)=>{
    var vao=gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    for(var i=0;i<locs.length;i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER,vertBufs[i]);
        gl.vertexAttribPointer(locs[i],sizes[i],types[i],false,0,0);
        gl.enableVertexAttribArray(locs[i]);
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indBuf);    
    gl.bindVertexArray(null);
    return vao;
}

mygl.createStridedVao=(gl,locs,sizes,types,stride,offsets,vertBuf,indBuf)=>{
    var vao=gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER,vertBuf);
    
    for(var i=0;i<locs.length;i++) {
        gl.vertexAttribPointer(locs[i],sizes[i],types[i],false,stride,offsets[i]);
        gl.enableVertexAttribArray(locs[i]);
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indBuf);    
    gl.bindVertexArray(null);
    return vao;
}

(()=>{
    function createShader(gl,key,type,src,onError) {
        var shader=gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var msg=gl.getShaderInfoLog(shader);
            onError(key + " : compile error.\n"+msg);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    function createProgram(gl,key,vs,fs,onError) {
        var prog=gl.createProgram();
        gl.attachShader(prog,vs);
        gl.attachShader(prog,fs);
        gl.linkProgram(prog);

        if(!gl.getProgramParameter(prog,gl.LINK_STATUS)) {
            var msg=gl.getProgramInfoLog(prog);
            onError(key + " : link error.\n"+msg);
            gl.deleteProgram(prog);
            return null;
        }

        return prog;
    }

    function createShaderPromise(gl,key,type,src) {
        return new Promise(function (resolve, reject) {
            var errMsg;

            var ret=createShader(gl,key,type,src,(e)=>{
                errMsg=e;
            });

            if(!ret) {
                reject(errMsg);
            } else {
                resolve(ret);
            }
        });
    }

    function createProgramPromise(gl,key,vs,fs) {
        return new Promise(function (resolve, reject) {
            var errMsg;
            var ret=createProgram(gl,key,vs,fs,(e)=>{errMsg=e;});
            if(!ret) {reject(errMsg); } else { resolve(ret); }
        });
    }

    function getShader(gl,type,fn) {
        var key=((type==gl.VERTEX_SHADER)?"v":"f")+":"+fn;
        gl.myShaders=gl.myShaders||{};

        if(key in gl.myShaders) {
            return gl.myShaders[key];
        }

        var shader=loadText(fn).then((src)=>{
            return createShaderPromise(gl,fn,type,src);
        });

        gl.myShaders[key]=shader;
        return shader;
    }

    mygl.getProgram=(gl,vsName,fsName)=>{
        var key=vsName+" + "+fsName;
        gl.myPrograms=gl.myPrograms||{};

        if(key in gl.myPrograms) {
            return gl.myPrograms[key];
        }

        //
        var vs=getShader(gl,gl.VERTEX_SHADER,vsName);
        var fs=getShader(gl,gl.FRAGMENT_SHADER,fsName);

        var prog=Promise.all([vs,fs]).then((result)=>{
            return createProgramPromise(gl,key,result[0],result[1]);
        });

        gl.myPrograms[key]=prog;
        return prog;
    }
})();