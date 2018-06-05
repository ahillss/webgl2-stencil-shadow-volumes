#version 300 es

layout(location=0) in vec3 a_pos;
layout(location=1) in vec3 a_nor;

layout(location=2) in vec2 a_tex;


uniform mat4 u_viewProjMat;
uniform mat4 u_modelMat;


out vec2 v_tex;

void main() {
  // v_col=a_col;
  v_tex=a_tex;


  gl_Position=u_viewProjMat*(u_modelMat*vec4(a_pos,1.0));
}
