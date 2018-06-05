var scalar=scalar||{};
var vec3=vec3||{};
var vec4=vec4||{};
var mat3=mat3||{};
var mat4=mat4||{};

vec3.add=(...args)=>{
    var result=[0,0,0];

    for(var i=0;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(3)).fill(args[i]);
        result.forEach((x,j)=>{result[j]+=arg[j]});
    }
    
    return result;
}

vec4.add=(...args)=>{
    var result=[0,0,0,0];
    
    for(var i=0;i<args.length;i++) {
        var arg=Array.isArray(arg)?args[i]:(new Array(4)).fill(args[i]);
        result.forEach((x,j)=>{result[j]+=arg[j]});
    }
    
    return result;
}

vec3.sub=(...args)=>{
    var result=Array.isArray(args[0])?args[0].slice():(new Array(3)).fill(args[0]);
    
    if(args.length==1) {
        result.forEach((x,i)=>{result[i]=-x});
    }
   
    for(var i=1;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(3)).fill(args[i]);
        result.forEach((x,j)=>{result[j]-=arg[j]});
    }
    
    return result;
}

vec4.sub=(...args)=>{
    var result=Array.isArray(args[0])?args[0].slice():(new Array(4)).fill(args[0]);
    
    if(args.length==1) {
        result.forEach((x,i)=>{result[i]=-x});
    }
   
    for(var i=1;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(4)).fill(args[i]);
        result.forEach((x,j)=>{result[j]-=arg[j]});
    }
    
    return result;
}

vec3.mul=(...args)=>{
    var result=[1,1,1];

    for(var i=0;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(3)).fill(args[i]);
        result.forEach((x,j)=>{result[j]*=arg[j]});
    }
    
    return result;
}

vec4.mul=(...args)=>{
    var result=[1,1,1,1];
    
    for(var i=0;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(4)).fill(args[i]);
        result.forEach((x,j)=>{result[j]*=arg[j]});
    }
    
    return result;
}

vec3.div=(...args)=>{
    var result=Array.isArray(args[0])?args[0].slice():(new Array(3)).fill(args[0]);
       
    for(var i=1;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(3)).fill(args[i]);
        result.forEach((x,j)=>{result[j]/=arg[j]});
    }
    
    return result;
}

vec4.div=(...args)=>{
    var result=Array.isArray(args[0])?args[0].slice():(new Array(4)).fill(args[0]);
       
    for(var i=1;i<args.length;i++) {
        var arg=Array.isArray(args[i])?args[i]:(new Array(4)).fill(args[i]);
        result.forEach((x,j)=>{result[j]/=arg[j]});
    }
    
    return result;
}

vec3.dot=(a,b)=>{
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
}

vec4.dot=(a,b)=>{
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];
}

vec3.length=(a)=>{
    return Math.sqrt(vec3.dot(a,a));
}

vec3.normal=(a)=>{
    return vec3.mul(a,1/vec3.length(a));
}

vec3.cross=(a,b)=>{
    return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
}

vec3.to_x0z=(a)=>{
    return [a[0],0,a[2]];
}

vec3.eq=(a,b)=>{
    if(Array.isArray(b)) {
        return a[0]==b[0] && a[1]==b[1] && a[2]==b[2];
    } else {
        return a[0]==b && a[1]==b && a[2]==b;
    }
}

vec4.eq=(a,b)=>{
    if(Array.isArray(b)) {
        return a[0]==b[0] && a[1]==b[1] && a[2]==b[2] && a[3]==b[3];
    } else {
        return a[0]==b && a[1]==b && a[2]==b && a[3]==b;
    }
}

mat3.identity=()=> {
    return [1,0,0, 0,1,0, 0,0,1];
}

mat4.mul=()=> {
    var result=mat4.identity();
    
    for(var i=0;i<args.length;i++) {
        if(args[i].length==16) {
        }
        var arg=Array.isArray(args[i])?args[i]:(new Array(4)).fill(args[i]);
        result.forEach((x,j)=>{result[j]*=arg[j]});
    }
    
    return result;
}

mat4.identity=()=>{
    return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
}

mat4.transpose=(m)=>{
    return [m[0],m[4],m[8],m[12], 
                 m[1],m[5],m[9],m[13],
                 m[2],m[6],m[10],m[14],
                m[3],m[7],m[11],m[15]];
}

mat4.inverse=(m)=>{
    //row major
    m=mat4.tranpose(m);
    
    var m2=m.slice();
    var tmp=mat4.identity();
    
  for(var K=0;K<4;++K) {
    var factor = m2[K*4+K];

    for(var q=0;q<4;q++) {
      m2[K*4+q] /= factor;
      tmp[K*4+q] /= factor;
    }

    for(var L=0;L<4;++L){
      if(K==L) {
        continue;
      }

      var coefficient = m2[L*4+K];

      for(var q=0;q<4;q++) {
        m2[L*4+q] -= coefficient*m2[K*4+q];
        tmp[L*4+q] -= coefficient*tmp[K*4+q];
      }
    }
  }
  
  //
  return mat4.tranpose(tmp); //to col major
}

mat4.normal=(m)=>{
    return mat4.transpose(mat4.inverse(m));
}

mat4.to_mat3=(m)=>{
    return [m[0],m[1],m[2], m[4],m[5],m[6], m[8],m[9],m[10]];
}

mat3.to_col=(a,col)=>{
    return a.slice(col*3,(col+1)*3);
}

mat4.to_col=(a,col)=>{
    return a.slice(col*4,(col+1)*4);
}
scalar.lerp=(x,y,a)=>{
    return x*(1.0-a)+y*a;
}

vec3.interp=(x,y,a)=>{
    a=Array.isArray(a)?a:(new Array(3)).fill(a);
    return [0,1,2].map((i)=>scalar.lerp(x[i],y[i],a[i]))
}







//////////



mat4.translate=(v)=>{
    return [1,0,0,0, 0,1,0,0, 0,0,1,0, v[0],v[1],v[2],1];
}

mat4.scale=(v)=>{
    return [v[0],0,0,0,  0,v[1],0,0, 0,0,v[2],0, 0,0,0,1];
}

mat4.rotateY=(a)=>{
    var c=Math.cos(a);
    var s=Math.sin(a);
    return [c,0.0,0
                -s, 0,1,0,0,
                s,0,c,0,
                0,0,0,1]
}

mat4.frustum_inf=(left,right,bottom,top,nearval)=>{
    var out=new Array(16);
    var ep=2.4e-7;

    out[0]=(2*nearval)/(right-left);
    out[1]=0;
    out[2]=0;
    out[3]=0;

    out[4]=0;
    out[5]=(2*nearval)/(top-bottom);
    out[6]=0;
    out[7]=0;

    out[8]=(right+left)/(right-left);
    out[9]=(top+bottom)/(top-bottom);
    out[10]=ep-1;//-(1-ep);
    out[11]=-1;

    out[12]=0;
    out[13]=0;
    out[14]=(ep-2)*nearval;//-((2-ep)*nearval);
    out[15]=0;
    
    return out;
}

mat4.frustum=(left,right,bottom,top,nearval,farval)=>{
    var out=new Array(16);
    
    out[0]=(2*nearval)/(right-left);
    out[1]=0;
    out[2]=0;
    out[3]=0;

    out[4]=0;
    out[5]=(2*nearval)/(top-bottom);
    out[6]=0;
    out[7]=0;

    out[8]=(right+left)/(right-left);
    out[9]=(top+bottom)/(top-bottom);
    out[10]=-(farval+nearval)/(farval-nearval);
    out[11]=-1;

    out[12]=0;
    out[13]=0;
    out[14]=-(2*farval*nearval)/(farval-nearval); //D;
    out[15]=0;
    
    return out;
}

mat4.perspective_fovy_inf=(fovy,aspect,znear)=>{
    var top=Math.tan(fovy/2)*znear;
    var right=top*aspect;
    return mat4.frustum_inf(-right,right,-top,top,znear);
}

mat4.perspective_fovy=(fovy,aspect,znear,zfar)=>{
    var top=Math.tan(fovy/2)*znear;
    var right=top*aspect;
    return mat4.frustum(-right,right,-top,top,znear,zfar);
}
