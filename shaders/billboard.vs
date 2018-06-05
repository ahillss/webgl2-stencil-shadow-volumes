#version 300 es

layout(location=0) in vec2 a_pos;

uniform mat4 u_projMat;
uniform mat4 u_modelViewMat;

// uniform mat4 u_modelViewProjMat;


out vec2 v_tex;

void main() {
  v_tex=a_pos;
  
  mat4 m=u_modelViewMat;
  m[0].xyz=vec3(1.0,0.0,0.0);
  m[1].xyz=vec3(0.0,1.0,0.0);
  m[2].xyz=vec3(0.0,0.0,1.0);
  
    gl_Position=u_projMat*m*vec4(a_pos*0.2,0.0,1.0);
}
