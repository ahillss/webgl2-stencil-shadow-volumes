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

out vec4 outColor;

vec3 checkerCol(vec2 texc, vec3 color0, vec3 color1) {
    float q=clamp(mod(dot(floor(texc),vec2(1.0)),2.0),0.0,1.0);
    return color1*q+color0*(1.0-q);
}


vec3 checkCol2(vec2 TexCoord,vec3  Color1,vec3  Color2,float Frequency) {
    //from OpenGL Shading Language by Randi J. Rost
    
    vec3  AvgColor=(Color1+Color2)*0.5;
    vec3 color;
    vec2 fw = fwidth(TexCoord);
    vec2 fuzz = fw * Frequency * 2.0;
    float fuzzMax = max(fuzz.s, fuzz.t);
    vec2 checkPos = fract(TexCoord * Frequency);

    if (fuzzMax < 0.5) {
        vec2 p = smoothstep(vec2(0.5), fuzz + vec2(0.5), checkPos) + (1.0 - smoothstep(vec2(0.0), fuzz, checkPos));
        color = mix(Color1, Color2, p.x * p.y + (1.0 - p.x) * (1.0 - p.y));
        color = mix(color, AvgColor, smoothstep(0.125, 0.5, fuzzMax));
    } else {
        color = AvgColor;
    }
    
    return color;
}

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
  
  vec3 col=checkCol2(v_tex*10.0, vec3(1.0), vec3(0.4,0.7,0.9),0.5);

  vec3 ambient=col*u_ambientCol;
   outColor=vec4(ambient+u_lightCol*(col*diffuse+spec),1.0);

}
