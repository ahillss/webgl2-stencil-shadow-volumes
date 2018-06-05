function vec3_cross(a,b) {
    return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}

function vec3_dot(a,b) {
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
}

function vec3_length(v) {
  return Math.sqrt(vec3_dot(v,v));
}

function vec3_normal(out,v) {
    var l=1/vec3_length(v);
    for(var i=0;i<3;i++){
        out[i]=v[i]*l;
    }
}

// function mat4_transposed(m) {
//     for(var i=0;i<4;i++){
//         for(var j=i+1;j<4;j++){
//             var tmp = m[i*4+j];
//             m[i*4+j] = m[j*4+i];
//             m[j*4+i] = tmp;
//         }
//     }
// }

// function mat4_inf_frustum(left,right,bottom,top,zNear) {
//     var out=[0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];

//     out[0]=(2*zNear)/(right-left);//x;
//     out[2]=(right+left)/(right-left);//A
//     out[5]=(2*zNear)/(top-bottom);//y;
//     out[6]=(top+bottom)/(top-bottom);//B;
//     out[10]=-1;//C;
//     out[11]=-2*zNear;//D;
//     out[14]=-1;

//     return out;
// }

// function mat4_inf_perspective_fovy(fovy,aspect,znear) {
//     var top=Math.tan(fovy/2)*znear;
//     var right=top*aspect;
//     return mat4_inf_frustum(-right,right,-top,top,znear);
// }

// function mat4_frustum(left,right,bottom,top,zNear,zFar) {
//     var out=[0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
//     out[0]=(2*zNear)/(right-left); //x
//     out[2]=(right+left)/(right-left); //A
//     out[5]=(2*zNear)/(top-bottom); //y
//     out[6]=(top+bottom)/(top-bottom); //B
//     out[10]=-(zFar+zNear)/(zFar-zNear); //C
//     out[11]=-(2*zFar*zNear)/(zFar-zNear); //D
//     out[14]=-1;
//     return out;
// }


// function mat4_ortho(left,right,bottom,top,nearVal,farVal) {
//     var out=[0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];

//     var tx = -(right+left)/(right-left);
//     var ty = -(top+bottom)/(top-bottom);
//     var tz = -(farVal+nearVal)/(farVal-nearVal);

//     out[0]=2/(right-left);
//     out[3]=tx;
//     out[5]=2/(top-bottom);
//     out[7]=ty;
//     out[10]=-2/(nearVal-farVal);
//     out[11]=tz;
//     out[15]=1;

//     return out;
// }

// function mat4_ortho2d(left,right,bottom,top) {
//   return mat4_ortho(left,right,bottom,top,-1,1);
// }

// function mat4_perspective_fovy(fovy,aspect,znear,zfar) {
//     var top=Math.tan(fovy/2)*znear;
//     var right=top*aspect;
//     return mat4_frustum(-right,right,-top,top,znear,zfar);
// }

// function mat4_mul_mat4(a,b) {
//     var tmp=[0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];

//     for(var i=0;i<4;i++) {
//         for(var j=0;j<4;j++){
//             var x=0;

//             for(var k=0;k<4;k++){
//                 x+=a[i*4+k]*b[k*4+j];
//             }

//             tmp[i*4+j]=x;
//         }
//     }

//     return tmp;
// }
// function mat4_mulVec4(m,v) {
//     var tmp=[0,0,0,0];

//     for(var i=0;i<4;i++) {
//         tmp[i]=0;

//         for(var j=0;j<4;j++){
//             tmp[i]+=m[i*4+j]*v[j];
//         }
//     }

//     return tmp;
// }

// function mat4_inverse(m) {
//     var m2=[m[0],m[1],m[2],m[3],m[4],m[5],m[6],m[7],m[8],m[9],m[10],m[11],m[12],m[13],m[14],m[15]];
//     var tmp=[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

//     for(var K=0;K<4;++K) {
//         var factor = m2[K*4+K];

//         for(var q=0;q<4;q++) {
//             m2[K*4+q] /= factor;
//             tmp[K*4+q] /= factor;
//         }

//         for(var L=0;L<4;++L){
//             if(K==L) {
//                 continue;
//             }

//             var coefficient = m2[L*4+K];

//             for(var q=0;q<4;q++) {
//                 m2[L*4+q] -= coefficient*m2[K*4+q];
//                 tmp[L*4+q] -= coefficient*tmp[K*4+q];
//             }
//         }
//     }

//     return tmp;
// }


function vec3_div_scalar(out,vec,scalar) {
    for(var i=0;i<3;i++) {
        out[i]=vec[i]/scalar;
    }
}

function vec4_dot(a,b) {
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];
}

function vec4_div_scalar(out,vec,scalar) {
    for(var i=0;i<4;i++) {
        out[i]=vec[i]/scalar;
    }
}

function mat4_mulVec4(out,mat,vec) {
    var tmp=[0,0,0,0];

    for(var i=0;i<4;i++) {
        for(var j=0;j<4;j++){
            tmp[i]+=mat[i+j*4]*vec[j];
        }
    }

    for(var i=0;i<4;i++) {
        out[i]=tmp[i];
    }
}

function mat4_frustum_inf(out,left,right,bottom,top,nearval) {
    var e=2.4e-7;

    out[0]=(2*nearval)/(right-left); //x
    out[1]=0;
    out[2]=0;
    out[3]=0;

    out[4]=0;
    out[5]=(2*nearval)/(top-bottom); //y
    out[6]=0;
    out[7]=0;

    out[8]=(right+left)/(right-left); //A
    out[9]=(top+bottom)/(top-bottom); //B
    out[10]=-(1-e); //C
    out[11]=-1;

    out[12]=0;
    out[13]=0;
    out[14]=-((2-e)*nearval); //D;
    out[15]=0;
}

function mat4_frustum(out,left,right,bottom,top,zNear,zFar) {

    out[0]=(2*zNear)/(right-left); //x
    out[1]=0;
    out[2]=0;
    out[3]=0;

    out[4]=0;
    out[5]=(2*zNear)/(top-bottom); //y
    out[6]=0;
    out[7]=0;

    out[8]=(right+left)/(right-left); //A
    out[9]=(top+bottom)/(top-bottom); //B
    out[10]=-(zFar+zNear)/(zFar-zNear); //C
    out[11]=-1;

    out[12]=0;
    out[13]=0;
    out[14]=-(2*zFar*zNear)/(zFar-zNear); //D;
    out[15]=0;

}

function mat4_perspective_fovy_inf(out,fovy,aspect,znear) {
    var top=Math.tan(fovy/2)*znear;
    var right=top*aspect;

    mat4_frustum_inf(out,-right,right,-top,top,znear);
}

function mat4_perspective_fovy(out,fovy,aspect,znear,zfar) {
    var top=Math.tan(fovy/2)*znear;
    var right=top*aspect;

    mat4_frustum(out,-right,right,-top,top,znear,zfar);
}

function mat4_invert(out, a) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }
  det = 1.0 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

  return out;
}


function posToNdcDepth(viewPosZ,znear,zfar) {
    var nf=znear-zfar;
    var p10=zfar+znear,p11=2*zfar*znear; //perspective
    //var p10=2, p11=znear-zfar; //ortho

    var clipZ=(viewPosZ*p10+p11)/nf;
    var clipW=-viewPosZ;
    var ndcZ = clipZ/clipW;

    return ndcZ;
}

function ndcToDepth(ndcZ,nearRange,farRange) {
    var diff=farRange-nearRange;
    return (diff*ndcZ + nearRange+farRange)*0.5;
}

function depthToPos(invProjMat,screen,depth) {
    //the depth*2-1 undoes the depth range from ndcToDepth
    var ndcPos=[screen[0]*2-1,screen[1]*2-1,depth*2-1];//vec3(screen,depth)*2-1
    var H=[ndcPos[0],ndcPos[1],ndcPos[2],1];
    var D=mat4_mulVec4(invProjMat,H);
    var pos=[D[0]/D[3],D[1]/D[3],D[2]/D[3]];//D.xyz/D.w
    return pos;
}

function linearDepth(depth,znear,zfar) {
    return (2*znear)/(zfar+znear-depth*(zfar-znear));
}

function vec3_sub(out,a,b) {
    out[0]=a[0]-b[0];
    out[1]=a[1]-b[1];
    out[2]=a[2]-b[2];
}

console.log("----");
var zNear=1;
var zFar=100;

var projMat=new Array(16);
var invProjMat=new Array(16);
var infProjMat=new Array(16);
var projLoc=new Array(4);
var infProjLoc=new Array(4);
var projLocNdc=new Array(3);
var infProjLocNdc=new Array(3);

mat4_perspective_fovy(projMat,0.78,1, zNear,zFar);
mat4_perspective_fovy_inf(infProjMat,0.78,1, zNear);


var loc=[-50,70,-52505, 1];
vec3_normal(loc,[0.6,0.4,-1]);
loc[3]=0;


mat4_mulVec4(projLoc,projMat,loc);
mat4_mulVec4(infProjLoc,infProjMat,loc);

// infProjLoc[2]+=-0.00000001;

vec3_div_scalar(projLocNdc,projLoc,projLoc[3]);
vec3_div_scalar(infProjLocNdc,infProjLoc,infProjLoc[3]);

var locDif=new Array(3);
var locNdcDif=new Array(3);
vec3_sub(locDif,projLoc,infProjLoc);
vec3_sub(locNdcDif,projLocNdc,infProjLocNdc);

console.log("a "+projLoc);
console.log("b "+infProjLoc);

console.log("c "+projLocNdc);
console.log("d "+infProjLocNdc);

console.log("a-b "+locDif);
console.log("c-d "+locNdcDif);

var invProjLoc=new Array(4);
mat4_invert(invProjMat,projMat);
mat4_mulVec4(invProjLoc,invProjMat,projLoc);
console.log("e "+invProjLoc)
// var pos=[]

// var invProjMat=mat4_inverse(projMat);
// var ndcZ = posToNdcDepth(-45,zNear,zFar);
// var depth=ndcToDepth(ndcZ,0,1);
// console.log("ndcZ = "+ndcZ)
// console.log("depth = "+depth);
// console.log("linearDepth= "+linearDepth(depth,zNear,zFar));

// var pos=depthToPos(invProjMat,[0.5,0.5],depth);
// console.log("pos = "+pos);


// console.log("+++++");

// var gaa=vec3_normal([0.5,0.1,0.9]);
// console.log(gaa)
// var bla=mat4_mulVec4(projMat,[gaa[0],gaa[1],gaa[2],0]);
// console.log(bla);
// console.log([bla[0]/bla[3],bla[1]/bla[3],bla[2]/bla[3]]);


/*
    out[0]=zNear/(top*aspect); //x
    out[5]=zNear/(Math.tan(fovy/2)*znear); //y
    out[10]=-(zFar+zNear)/(zFar-zNear); //C
    out[11]=-(2*zFar*zNear)/(zFar-zNear); //D
    out[14]=-1;

    0 1 2 3
    4 5 6 7
    8 9 10 11
    12 13 14 15
*/
