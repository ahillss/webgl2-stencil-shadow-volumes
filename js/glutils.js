var glutil=glutil||{};




function uniformLoc(gl,p,n) {
    p.myUniformLocs=p.myUniformLocs?p.myUniformLocs:{};

    if(n in p.myUniformLocs) {
        return p.myUniformLocs[n];
    }

    var loc=gl.getUniformLocation(p,n);
    p.myUniformLocs[n]=loc;
    return loc;
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

function loadTextureCube(gl,fns,linear,mipmap) {
    return Promise.all(fns.map(x=>loadImage(x))).then(function (imgs) {
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

        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER,linear?gl.LINEAR:gl.NEAREST);
        
        if(mipmap) {
            gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER,linear?gl.LINEAR_MIPMAP_LINEAR:gl.NEAREST_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        } else {
            gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER,linear?gl.LINEAR:gl.NEAREST);
        }

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
