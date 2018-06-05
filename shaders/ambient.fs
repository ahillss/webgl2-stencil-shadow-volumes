#version 300 es

precision highp float;

uniform vec3 u_ambientCol;
uniform vec3 u_materialCol;



out vec4 outColor;

void main() {
 

  vec3 col=u_ambientCol*u_materialCol;
  
   outColor=vec4(col,1.0);
}
