#version 300 es
precision highp float;

layout(location=0) in vec3 a_pos0; //edge vert 0
layout(location=1) in vec3 a_pos1; //edge vert 1
layout(location=2) in vec3 a_posAdj0; //triangle vert 0
layout(location=3) in vec3 a_posAdj1; //triangle vert 1


uniform mat4 u_viewProjMat;
uniform mat4 u_modelMat;
uniform vec3 u_lightPos;




uniform bool u_useBack;

bool isFaceLit(vec3 p0,vec3 p1,vec3 p2) {
    vec3 n=cross(p1 - p0,p2 - p0);
    vec3 d0 = u_lightPos-p0;
    vec3 d1 = u_lightPos-p1;
    vec3 d2 = u_lightPos-p2;
    
    if(u_useBack) {
        return (dot(n,d0)<0.0 || dot(n,d1)<0.0 || dot(n,d2)<0.0);
    } else {
        return (dot(n,d0)>0.0 || dot(n,d1)>0.0 || dot(n,d2)>0.0);
    }
}

void main() {
    
    int type=gl_VertexID%4;
    
    if(type<2) {
        vec3 ap=(type==0)?a_pos0:a_pos1;
        gl_Position=u_viewProjMat*u_modelMat*vec4(ap,1.0);
    } else { //extruded (type == 2 or 3)       

        vec3 vert0=(u_modelMat*vec4(a_pos0,1.0)).xyz;
        vec3 vert1=(u_modelMat*vec4(a_pos1,1.0)).xyz;
        vec3 adjVert0=(u_modelMat*vec4(a_posAdj0,1.0)).xyz;
        vec3 adjVert1=(u_modelMat*vec4(a_posAdj1,1.0)).xyz;
        
        bool lit0=isFaceLit(vert0,vert1,adjVert0);
        bool lit1=isFaceLit(vert1,vert0,adjVert1);

        if(lit0 && !lit1) { //extrude
            vec3 ap=(type==2)?vert0:vert1;
            vec3 L=normalize(ap-u_lightPos);
            vec4 v=vec4(L,0.0);
            gl_Position=u_viewProjMat*v;
        } else {
            vec3 ap=(type==2)?vert0:vert1;
            gl_Position=u_viewProjMat*vec4(ap,1.0);

        }
    }
}
