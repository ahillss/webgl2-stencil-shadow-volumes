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

mygl.setDrawStates=(gl,clear,inputStates)=>{
    gl.myDrawStates=gl.myDrawStates||{};
    var toStates={};

    //helper functions
    function setToState(stateName,altStateName,defaultVal) {
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

    function setBoolState(enumVal,stateName) {
        if(toStates[stateName]!=gl.myDrawStates[stateName]) {
            gl.myDrawStates[stateName]=toStates[stateName];
            if(toStates[stateName]) {
                gl.enable(enumVal);
            } else {
                gl.disable(enumVal);
            }
        }
    }

    function setArrayState(func,stateName,required) {
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

    function setParamState(func,stateNames,pre,required) {
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

    //set values to update with
    setToState("blend",false,false);
    setToState("blend_color",false,[0,0,0,0]);
    setToState("blend_equation_rgb","blend_equation",gl.FUNC_ADD);
    setToState("blend_equation_alpha","blend_equation",gl.FUNC_ADD);
    setToState("blend_src_rgb","blend_src",gl.ONE);
    setToState("blend_src_alpha","blend_src",gl.ONE);
    setToState("blend_dst_rgb","blend_dst",gl.ZERO);
    setToState("blend_dst_alpha","blend_dst",gl.ZERO);

    setToState("cull_face",false,false);
    setToState("cull_face_mode",false,gl.BACK);
    setToState("front_face",false,gl.CCW);

    setToState("depth_test",false,false);
    setToState("depth_func",false,gl.LESS);
    setToState("depth_writemask",false,true);
    setToState("depth_range",false,[0,1]);

    setToState("polygon_offset_fill",false,false);
    setToState("polygon_offset_factor",false,0);
    setToState("polygon_offset_units",false,0);

    setToState("stencil_test",false,false);
    setToState("stencil_back_func","stencil_func",gl.ALWAYS);
    setToState("stencil_back_ref","stencil_ref",0);
    setToState("stencil_back_valuemask","stencil_valuemask",0xffffffff);
    setToState("stencil_back_writemask","stencil_writemask",0xffffffff);
    setToState("stencil_back_pass_depth_fail","stencil_pass_depth_fail",gl.KEEP);
    setToState("stencil_back_pass_depth_pass","stencil_pass_depth_pass",gl.KEEP);
    setToState("stencil_back_fail","stencil_fail",gl.KEEP);
    setToState("stencil_front_func","stencil_func",gl.ALWAYS);
    setToState("stencil_front_ref","stencil_ref",0);
    setToState("stencil_front_valuemask","stencil_valuemask",0xffffffff);
    setToState("stencil_front_writemask","stencil_writemask",0xffffffff);
    setToState("stencil_front_pass_depth_fail","stencil_pass_depth_fail",gl.KEEP);
    setToState("stencil_front_pass_depth_pass","stencil_pass_depth_pass",gl.KEEP);
    setToState("stencil_front_fail","stencil_fail",gl.KEEP);

    setToState("scissor_test",false,false);
    setToState("scissor_box",false,[0,0,0,0]);

    setToState("dither",false,true);
    setToState("color_writemask",false,[true,true,true,true]);
    setToState("line_width",false,1);

    //set gl states
    setBoolState(gl.DEPTH_TEST,"depth_test");
    setParamState(gl.depthFunc,["depth_func"],false,"depth_test");
    setParamState(gl.depthMask,["depth_writemask"],false,"depth_test");
    setArrayState(gl.depthRange,"depth_range","depth_test");

    setBoolState(gl.BLEND,"blend");
    setArrayState(gl.blendColor,"blend_color","blend");
    setParamState(gl.blendEquationSeparate,["blend_equation_rgb","blend_equation_alpha"],false,"blend");
    setParamState(gl.blendFuncSeparate,["blend_src_rgb","blend_dst_rgb","blend_src_alpha","blend_dst_alpha"],false,"blend");

    setBoolState(gl.STENCIL_TEST,"stencil_test");
    setParamState(gl.stencilFuncSeparate,["stencil_front_func","stencil_front_ref","stencil_front_valuemask"],gl.FRONT,"stencil_test");
    setParamState(gl.stencilFuncSeparate,["stencil_back_func","stencil_back_ref","stencil_back_valuemask"],gl.BACK,"stencil_test");
    setParamState(gl.stencilMaskSeparate,["stencil_front_writemask"],gl.FRONT,"stencil_test");
    setParamState(gl.stencilMaskSeparate,["stencil_back_writemask"],gl.BACK,"stencil_test");
    setParamState(gl.stencilOpSeparate,["stencil_front_fail","stencil_front_pass_depth_fail","stencil_front_pass_depth_pass"],gl.FRONT,"stencil_test");
    setParamState(gl.stencilOpSeparate,["stencil_back_fail","stencil_back_pass_depth_fail","stencil_back_pass_depth_pass"],gl.BACK,"stencil_test");

    setBoolState(gl.CULL_FACE,"cull_face");
    setParamState(gl.cullFace,["cull_face_mode"],false,"cull_face");
    setParamState(gl.frontFace,["front_face"],false,false);

    setBoolState(gl.POLYGON_OFFSET_FILL,"polygon_offset_fill");
    setParamState(gl.polygonOffset,["polygon_offset_factor","polygon_offset_units"],false,"polygon_offset_fill");

    setBoolState(gl.SCISSOR_TEST,"scissor_test");
    setArrayState(gl.scissor,"scissor_box","scissor_test");

    setBoolState(gl.DITHER,"dither");
    setArrayState(gl.colorMask,"color_writemask",false);
    setParamState(gl.lineWidth,["line_width"],false,false);
}

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
