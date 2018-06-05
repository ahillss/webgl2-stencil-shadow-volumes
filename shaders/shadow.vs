#version 300 es
precision highp float;

in vec4 a_pos;

uniform mat4 u_projMat;
uniform mat4 u_modelViewMat;
uniform vec4 u_lightViewPos;
uniform float u_shadowExtrude;
uniform bool u_useInfinite;

void main() {
    vec3 pos=(u_modelViewMat*vec4(a_pos.xyz,1.0)).xyz;
    vec4 clip;
    
    vec4 P;

    if(a_pos.w == 1.0) {
        P=vec4(pos.xyz,1.0);
    } else {
        vec3 L=normalize(u_lightViewPos.w*pos.xyz-u_lightViewPos.xyz);

        if(u_useInfinite) {
            P=vec4(L,0.0);
        } else {
            P=vec4(pos.xyz+L*u_shadowExtrude, 1.0);
        }
    }
    
        clip=u_projMat*P;
    
    //~ if(u_useInfinite ) {//&& clip.z/clip.w>=1.0
        //~ //float ep=2.4e-7;
        //~ //float nearval=1.0;
       //~ //clip.z=dot(vec4(0.0,0.0,-(1.0-ep),-((2.0-ep)*nearval)),P);
       //~ clip.z=min(clip.z,clip.w);
    //~ }

    gl_Position=clip;


}
