var glutil=glutil||{};


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

function getProgram(gl,vsName,fsName) {
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

function uniformLoc(gl,p,n) {
    p.myUniformLocs=p.myUniformLocs?p.myUniformLocs:{};

    if(n in p.myUniformLocs) {
        return p.myUniformLocs[n];
    }

    var loc=gl.getUniformLocation(p,n);
    p.myUniformLocs[n]=loc;
    return loc;
}



function createVertexBuffer(data) {
    var buf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,Array.isArray(data)?(new Float32Array(data)):data,gl.STATIC_DRAW);
    return buf;
}

function createIndexBuffer(data) {
    var buf=gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,Array.isArray(data)?(new Uint32Array(data)):data,gl.STATIC_DRAW);
    return buf;
}

function createGeometry(...args) {
    var verts=args.slice(0,args.length-1);
    var indData=args[args.length-1];
    
    var vao=gl.createVertexArray();
    gl.bindVertexArray(vao);

    for(var i=0;i<verts.length;i++) {
        var index=verts[i][0];
        var length=verts[i][1];
        var data=verts[i][2];

        createVertexBuffer(data);
        gl.vertexAttribPointer(index,length,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(index);
    }

    if(indData) {
        createIndexBuffer(indData);
    }

    gl.bindVertexArray(null);
    return vao;
}

function createBindScreenGeometry(gl) {
    var vao=gl.createVertexArray();
    var vertBuf=gl.createBuffer();

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER,vertBuf);
    gl.bufferData(gl.ARRAY_BUFFER,(new Float32Array([-1,-1,1,-1,-1,1,1,1])),gl.STATIC_DRAW);
    gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(0);
}

function loadTexture2d(gl,fn,internalFormat,format,type,clamp,linear,mipmap) {
    return loadImage(fn).then(function (image) {
        var tex=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, format, type, image);

        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,clamp?gl.CLAMP_TO_EDGE:gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,clamp?gl.CLAMP_TO_EDGE:gl.REPEAT);
        
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,linear?gl.LINEAR:gl.NEAREST);

        if(mipmap) {
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,linear?gl.LINEAR_MIPMAP_LINEAR:gl.NEAREST_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,linear?gl.LINEAR:gl.NEAREST);
        }

        return Promise.resolve(tex);
    });
}

function loadTextureCube(gl,px,nx,py,ny,pz,nz) {
    var p=Promise.all([loadImage(px),loadImage(nx),loadImage(py),loadImage(ny),loadImage(nz),loadImage(nz)]);
    return p.then(function (imgs) {
        var tex=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[0]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[1]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[2]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[3]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[4]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgs[5]);

        glTexParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        glTexParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        glTexParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);//LINEAR_MIPMAP_LINEAR

        // gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        return Promise.resolve(tex);
    });
}

function createFakeTexture2d(gl) {
    var tex=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    var fakeImage=new Uint8Array(4);
    fakeImage[0]=127;
    fakeImage[1]=127;
    fakeImage[2]=255;
    fakeImage[3]=255;

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1,1,0,gl.RGBA, gl.UNSIGNED_BYTE, fakeImage);

    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);

    return tex;

}

function createFakeTextureCube(gl) {


    var tex=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

    var faces = [gl.TEXTURE_CUBE_MAP_POSITIVE_X,gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                 gl.TEXTURE_CUBE_MAP_POSITIVE_Y,gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                 gl.TEXTURE_CUBE_MAP_POSITIVE_Z,gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];

    var cols=[[255,150,50],[150,255,255],[150,255,150],[255,50,255],[150,150,255],[255,255,150]]

    //
    for (var i = 0; i < faces.length; i++) {
        var fakeImage=new Uint8Array(4);
        fakeImage[0]=cols[i][0];
        fakeImage[1]=cols[i][1];
        fakeImage[2]=cols[i][2];
        fakeImage[3]=255;
        gl.texImage2D(faces[i], 0, gl.RGBA, 1,1,0,gl.RGBA, gl.UNSIGNED_BYTE, fakeImage);
    }


    glTexParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    glTexParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    glTexParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);


    return tex;
}

function setFrameBuffer(gl,attachments) {
    //~ var key="";
    
    //~ color
    //~ depth
    //~ stencil
    //~ depth_stencil
    
    //~ key+=attachments[" "+
    
    
    
    //~ var fbo;
}
