#version 300 es

precision highp float;

in vec2 v_tex;

out vec4 outColor;

void main() {
    float q=length(v_tex);
    outColor=vec4((0.5/(q*q))*(1.0-q));
}