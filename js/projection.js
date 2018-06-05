
function mat4_frustum_inf(out,left,right,bottom,top,nearval) {
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
}

function mat4_frustum(out,left,right,bottom,top,nearval,farval) {

    
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