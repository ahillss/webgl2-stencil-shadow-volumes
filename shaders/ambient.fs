#version 300 es

precision highp float;

uniform vec3 u_ambientCol;
uniform vec3 u_materialCol;

in vec2 v_tex;

uniform sampler2D u_colMap;
uniform bool u_useTexture;

out vec4 outColor;

void main() {
  vec3 col=u_ambientCol*u_materialCol;
  
  if(u_useTexture) {
      //col*=texture(u_colMap,v_tex).rgb;
  }
  
   outColor=vec4(col,1.0);
}
