#version 300 es

precision highp float;

uniform vec3 u_ambientCol;
uniform vec3 u_materialCol;

in vec2 v_tex;

uniform sampler2D u_colMap;

out vec4 outColor;

void main() {
 
  vec3 col=texture(u_colMap,v_tex).rgb*u_ambientCol*u_materialCol;
  
   outColor=vec4(col,1.0);
}
