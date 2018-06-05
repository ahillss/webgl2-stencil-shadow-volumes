#version 300 es

layout(location=0) in vec3 a_pos;
layout(location=1) in vec3 a_nor;

#if defined(COLTEX)
layout(location=2) in vec2 a_tex;
#endif


uniform mat4 u_viewProjMat;
uniform mat4 u_modelMat;
uniform mat4 u_modelViewMat;
uniform mat3 u_normalMat;

out vec3 v_nor;
// varying vec3 v_col;
out vec3 v_pos;


void main() {

  v_nor=u_normalMat*a_nor;
  v_pos=(u_modelViewMat*vec4(a_pos,1.0)).xyz;
  
  gl_Position=u_viewProjMat*(u_modelMat*vec4(a_pos,1.0));
  
}
