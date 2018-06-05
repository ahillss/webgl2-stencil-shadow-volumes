#version 300 es

precision highp float;

uniform vec3 u_ambientCol;
uniform vec3 u_materialCol;

in vec2 v_tex;

uniform sampler2D u_colMap;

out vec4 outColor;

vec3 checkCol2(vec2 TexCoord,vec3  Color1,vec3  Color2,float Frequency) {
    vec3  AvgColor=(Color1+Color2)*0.5;

    vec3 color;

    // Determine the width of the projection of one pixel into s-t space
    vec2 fw = fwidth(TexCoord);

    // Determine the amount of fuzziness
    vec2 fuzz = fw * Frequency * 2.0;

    float fuzzMax = max(fuzz.s, fuzz.t);

    // Determine the position in the checkerboard pattern
    vec2 checkPos = fract(TexCoord * Frequency);

    if (fuzzMax < 0.5) {
        // If the filter width is small enough, compute the pattern color
        vec2 p = smoothstep(vec2(0.5), fuzz + vec2(0.5), checkPos) + (1.0 - smoothstep(vec2(0.0), fuzz, checkPos));

        color = mix(Color1, Color2, p.x * p.y + (1.0 - p.x) * (1.0 - p.y));

        // Fade in the average color when we get close to the limit
        color = mix(color, AvgColor, smoothstep(0.125, 0.5, fuzzMax));
    } else {
        // Otherwise, use only the average color
        color = AvgColor;
    }
    
    return color;
}

void main() {
 
  vec3 col;//=texture(u_colMap,v_tex).rgb*u_ambientCol*u_materialCol;
  col=checkCol2(v_tex*10.0, vec3(1.0), vec3(0.4,0.7,0.9),0.5)*u_ambientCol*u_materialCol;
   outColor=vec4(col,1.0);
}
