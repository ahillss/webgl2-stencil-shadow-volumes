#version 300 es

precision highp float;

uniform vec4 u_lightViewPos;
uniform vec3 u_lightAtten;
uniform vec3 u_lightCol;
uniform vec3 u_ambientCol;
uniform vec3 u_materialCol;

uniform float u_strength;
uniform float u_shininess;

in vec3 v_nor;
in vec3 v_pos;
in vec2 v_tex;

uniform sampler2D u_colMap;
uniform bool u_useTexture;


out vec4 outColor;


void main() {
  vec3 nor=normalize(v_nor);
  vec3 lightDir=u_lightViewPos.xyz-v_pos;
  float lightDist=length(lightDir);
  lightDir=lightDir/lightDist;

  float atten = 1.0/(u_lightAtten.x+u_lightAtten.y*lightDist+
                     u_lightAtten.z*lightDist*lightDist);

  vec3 reflectVec=reflect(-lightDir,nor);
  float NdotL = max(0.0,dot(nor,lightDir));
  float spec=0.0;

  if(NdotL > 0.0) {
    float NdotR = max(0.0, dot(nor, reflectVec));
    spec = pow(NdotR, u_shininess) * u_strength;
  }

  float diffuse=NdotL*atten;
  
  vec3 col=u_materialCol;

  if(u_useTexture) {
    //col*=texture(u_colMap,v_tex).rgb;
  }

  vec3 ambient=col*u_ambientCol;
   outColor=vec4(ambient+u_lightCol*(col*diffuse+spec),1.0);
}
