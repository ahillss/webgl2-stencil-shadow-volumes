#version 300 es
precision highp float;


layout(location=0) in vec3 a_pos0;
layout(location=1) in vec3 a_pos1;
layout(location=2) in vec3 a_pos2;

uniform mat4 u_viewProjMat;
uniform mat4 u_modelMat;
uniform vec3 u_lightPos;

uniform bool u_useBack;
uniform float u_shadowExtrude;


vec3 calcTriNor(vec3 p0,vec3 p1,vec3 p2) {
    return (cross(p1 - p0,p2 - p0));
}

bool isFaceLit(vec3 p0,vec3 p1,vec3 p2, vec3 n) {
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
    
    vec3 vert0=(u_modelMat*vec4(a_pos0,1.0)).xyz;
    vec3 vert1=(u_modelMat*vec4(a_pos1,1.0)).xyz;
    vec3 vert2=(u_modelMat*vec4(a_pos2,1.0)).xyz;

    vec3 nor=calcTriNor(vert0,vert1,vert2);
    
    if(isFaceLit(vert0,vert1,vert2,nor)) {
        vec3 L=normalize(vert0-u_lightPos);
        vec4 v=vec4(L,0.0);
        gl_Position=u_viewProjMat*v;
    } else {
        gl_Position=vec4(0.0);
    }
    
}


