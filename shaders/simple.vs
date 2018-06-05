#version 300 es

layout(location=0) in vec3 a_pos;


uniform mat4 u_viewProjMat;
uniform mat4 u_modelMat;


void main() {
  gl_Position=u_viewProjMat*(u_modelMat*vec4(a_pos,1.0));
  //gl_Position=u_projMat*(u_modelViewMat*vec4(a_pos,1.0));
}
