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
    gl.myDrawStates["rasterizer_discard"]=gl.getParameter(gl.RASTERIZER_DISCARD);

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

    var toSetStates=[
        ["blend",false,false],
        ["blend_color",false,[0,0,0,0]],
        ["blend_equation_rgb","blend_equation",gl.FUNC_ADD],
        ["blend_equation_alpha","blend_equation",gl.FUNC_ADD],
        ["blend_src_rgb","blend_src",gl.ONE],
        ["blend_src_alpha","blend_src",gl.ONE],
        ["blend_dst_rgb","blend_dst",gl.ZERO],
        ["blend_dst_alpha","blend_dst",gl.ZERO],
        ["color_writemask",false,[true,true,true,true]],
        ["cull_face",false,false],
        ["cull_face_mode",false,gl.BACK],
        ["depth_test",false,false],
        ["depth_func",false,gl.LESS],
        ["depth_writemask",false,true],
        ["depth_range",false,[0,1]],
        ["dither",false,true],
        ["front_face",false,gl.CCW],
        ["line_width",false,1],
        ["polygon_offset_fill",false,false],
        ["polygon_offset_factor",false,0],
        ["polygon_offset_units",false,0],
        ["rasterizer_discard",false,false],
        ["scissor_test",false,false],
        ["scissor_box",false,[0,0,0,0]],
        ["stencil_test",false,false],
        ["stencil_back_func","stencil_func",gl.ALWAYS],
        ["stencil_back_ref","stencil_ref",0],
        ["stencil_back_valuemask","stencil_valuemask",0xffffffff],
        ["stencil_back_writemask","stencil_writemask",0xffffffff],
        ["stencil_back_pass_depth_fail","stencil_pass_depth_fail",gl.KEEP],
        ["stencil_back_pass_depth_pass","stencil_pass_depth_pass",gl.KEEP],
        ["stencil_back_fail","stencil_fail",gl.KEEP],
        ["stencil_front_func","stencil_func",gl.ALWAYS],
        ["stencil_front_ref","stencil_ref",0],
        ["stencil_front_valuemask","stencil_valuemask",0xffffffff],
        ["stencil_front_writemask","stencil_writemask",0xffffffff],
        ["stencil_front_pass_depth_fail","stencil_pass_depth_fail",gl.KEEP],
        ["stencil_front_pass_depth_pass","stencil_pass_depth_pass",gl.KEEP],
        ["stencil_front_fail","stencil_fail",gl.KEEP]];

    var setArrayStates=[
        [gl.blendColor,"blend_color","blend"],
        [gl.colorMask,"color_writemask",false],
        [gl.depthRange,"depth_range","depth_test"],
        [gl.scissor,"scissor_box","scissor_test"]];

    var setParamStates=[
        [gl.blendEquationSeparate,["blend_equation_rgb","blend_equation_alpha"],false,"blend"],
        [gl.blendFuncSeparate,["blend_src_rgb","blend_dst_rgb","blend_src_alpha","blend_dst_alpha"],false,"blend"],
        [gl.cullFace,["cull_face_mode"],false,"cull_face"],
        [gl.depthFunc,["depth_func"],false,"depth_test"],
        [gl.depthMask,["depth_writemask"],false,"depth_test"],
        [gl.frontFace,["front_face"],false,false],
        [gl.lineWidth,["line_width"],false,false],
        [gl.polygonOffset,["polygon_offset_factor","polygon_offset_units"],false,"polygon_offset_fill"],
        [gl.stencilFuncSeparate,["stencil_front_func","stencil_front_ref","stencil_front_valuemask"],gl.FRONT,"stencil_test"],
        [gl.stencilFuncSeparate,["stencil_back_func","stencil_back_ref","stencil_back_valuemask"],gl.BACK,"stencil_test"],
        [gl.stencilMaskSeparate,["stencil_front_writemask"],gl.FRONT,"stencil_test"],
        [gl.stencilMaskSeparate,["stencil_back_writemask"],gl.BACK,"stencil_test"],
        [gl.stencilOpSeparate,["stencil_front_fail","stencil_front_pass_depth_fail","stencil_front_pass_depth_pass"],gl.FRONT,"stencil_test"],
        [gl.stencilOpSeparate,["stencil_back_fail","stencil_back_pass_depth_fail","stencil_back_pass_depth_pass"],gl.BACK,"stencil_test"]];

    var setBoolStates=[
        [gl.BLEND,"blend"],
        [gl.CULL_FACE,"cull_face"],
        [gl.DEPTH_TEST,"depth_test"],
        [gl.DITHER,"dither"],
        [gl.POLYGON_OFFSET_FILL,"polygon_offset_fill"],
        [gl.RASTERIZER_DISCARD,"rasterizer_discard"],
        [gl.SCISSOR_TEST,"scissor_test"],
        [gl.STENCIL_TEST,"stencil_test"]];
        
    //set values to update with
    var toStates={};
    
    for(var i=0;i<toSetStates.length;i++) {
        var stateName=toSetStates[i][0];
        var altStateName=toSetStates[i][1];
        var defaultVal=toSetStates[i][2];
        
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

    //set states
    
    for(var i=0;i<setArrayStates.length;i++) {
        var func=setArrayStates[i][0];
        var stateName=setArrayStates[i][1];
        var required=setArrayStates[i][2];
        var update=false;
        
        if(required!==false && toStates[required]===false) {
            continue;
        }

        if(gl.myDrawStates[stateName]==undefined) {
            update=true;
        } else {
            for(var j=0;j<toStates[stateName].length;j++) {
                if(gl.myDrawStates[stateName][j]!=toStates[stateName][j]) {
                    update=true;
                    break;
                }
            }
        }

        if(!update) {
            continue;
        }

        gl.myDrawStates[stateName]=toStates[stateName].slice();
        func.apply(gl,toStates[stateName]);
    }

    for(var i=0;i<setParamStates.length;i++) {
        var func=setParamStates[i][0];
        var stateNames=setParamStates[i][1];
        var pre=setParamStates[i][2];
        var required=setParamStates[i][3];
        
        if(required!==false && toStates[required]===false) {
            continue;
        }

        var update=false;

        for(var j=0;j<stateNames.length;j++) {
            var stateName=stateNames[j];

            if(gl.myDrawStates[stateName] != toStates[stateName]) {
                update=true;
                break;
            }
        }

        if(!update) {
            continue;
        }

        for(var j=0;j<stateNames.length;j++) {
            gl.myDrawStates[stateNames[j]] = toStates[stateNames[j]];
        }

        var params=stateNames.map(x => toStates[x]);

        if(pre!==false) {
            params.unshift(pre);
        }

        func.apply(gl,params);
    }
        
    for(var i=0;i<setBoolStates.length;i++) {
        var enumVal=setBoolStates[i][0];
        var stateName=setBoolStates[i][1];
        
        if(toStates[stateName]!=gl.myDrawStates[stateName]) {
            gl.myDrawStates[stateName]=toStates[stateName];
            
            if(toStates[stateName]) {
                gl.enable(enumVal);
            } else {
                gl.disable(enumVal);
            }
        }
    }
}


//

mygl.setUniform=(gl,f,n,...v)=>{
    v[v.length-1]=(Array.isArray(v[v.length-1]))?v[v.length-1].slice(0):v[v.length-1];
    gl.myUniforms=gl.myUniforms||[{}];
    gl.myUniforms[gl.myUniforms.length-1][n]={"func":f,"val":v,"id":{}};
}

mygl.applyUniforms=(gl,prog)=>{
    gl.myUniforms=gl.myUniforms||[{}];
    prog.myUniforms=prog.myUniforms||{};

    for(var k in gl.myUniforms[gl.myUniforms.length-1]) {
        prog.myUniforms[k]=prog.myUniforms[k]||{"loc":gl.getUniformLocation(prog,k), "func":null, "val":null, "id":{}};
        var pp=prog.myUniforms[k];
        var gg=gl.myUniforms[gl.myUniforms.length-1][k];
        
        if(pp.loc!=null && pp.id!=gg.id) {
            //for samplers
            if(gg.func==gl.uniform1i && pp.val && gg.val[0]==pp.val[0]) { 
                continue
            }
            
            //
            gg.func.apply(gl,[pp.loc].concat(gg.val));
            
            //
            pp.id=gg.id;
            pp.func=gg.func;
            pp.val=gg.val;
        }
    }
}

mygl.uniformsPush=(gl)=>{
    gl.myUniforms=gl.myUniforms||[{}];
    gl.myUniforms.push(Object.assign({},gl.myUniforms[gl.myUniforms.length-1]));
}

mygl.uniformsPop=(gl)=>{
    gl.myUniforms=gl.myUniforms||[{}];
    if(gl.myUniforms.length>1) { gl.myUniforms.pop(); }
}

//

mygl.createVertBuf=(gl,data,usage)=>{
    var buf=gl.createBuffer();
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,data,usage?usage:gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);
    return buf;
}

mygl.createIndBuf=(gl,data,usage)=>{
    var buf=gl.createBuffer();
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,data,usage?usage:gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    return buf;
}

mygl.createVao=(gl,locs,sizes,types,strides,offsets,vertBufs,indBuf,divisors)=>{
    var vao=gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    for(var i=0;i<locs.length;i++) {
        var stride=strides?strides[i]:0;
        var offset=offsets?offsets[i]:0;
        
        if(vertBufs[i]) {
            gl.bindBuffer(gl.ARRAY_BUFFER,vertBufs[i]);
        }
        
        gl.vertexAttribPointer(locs[i],sizes[i],types[i],false,stride,offset);
        
        if(divisors) {
            gl.vertexAttribDivisor(locs[i],divisors[i]);
        }
        
        gl.enableVertexAttribArray(locs[i]);
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indBuf);
    
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    
    return vao;
}

mygl.createShader=(gl,type,src,onError,onSuccess)=>{
    var shader=gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        onError(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    if(onSuccess) {
        onSuccess(shader);
    }

    return shader;
}

mygl.createProgram=(gl,vs,fs,beforeLinkCallback,onError,onSuccess)=>{
    var prog=gl.createProgram();
    gl.attachShader(prog,vs);
    gl.attachShader(prog,fs);
    
    if(beforeLinkCallback) {
        beforeLinkCallback(prog);
    }
    
    gl.linkProgram(prog);

    if(!gl.getProgramParameter(prog,gl.LINK_STATUS)) {
        onError(gl.getProgramInfoLog(prog));
        gl.deleteProgram(prog);
        return null;
    }
    
    if(onSuccess) {
        onSuccess(prog);
    }
    
    return prog;
}
