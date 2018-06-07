/*
 * point/directional light, backfaced, zfail, infinite
 * can be converted for front faced and zpass by following notes in comments
 * expects vertex at index 0 to represent no adjacency (aka a hole in the mesh)
 * light is in world space
 */
 
[vertex_shader]

#version 440

layout(location = 0) in vec4 a_pos;

out int vertexID;

uniform mat4 u_modelMat;

void main() {
    vertexID=gl_VertexID;
    gl_Position=u_modelMat*a_pos;
}

[geometry_shader]

#version 440

layout(triangles_adjacency) in;
layout(triangle_strip, max_vertices=18) out;

in int vertexID[];

uniform mat4 u_viewProjMat;
uniform vec4 u_light;

bool isFaceLit(vec3 v0, vec3 v1, vec3 v2) {
    vec3 n=cross(v1-v0,v2-v0);
    vec3 d0 = u_light.xyz-u_light.w*v0;
    vec3 d1 = u_light.xyz-u_light.w*v1;
    vec3 d2 = u_light.xyz-u_light.w*v2;
    return (dot(n,d0)>0.0 || dot(n,d1)>0.0 || dot(n,d2)>0.0);
}

void main() {
    if(!isFaceLit(gl_in[4].gl_Position.xyz,gl_in[2].gl_Position.xyz,gl_in[0].gl_Position.xyz)) { //for front faced switch 0 and 4 
        return;
    }

    for(int i=0; i<3; i++) {
        int i0 = i*2;
        int nb = (i*2+1);
        int i1 = (i*2+2) % 6;

        if(vertexID[nb]==0||!isFaceLit(gl_in[i1].gl_Position.xyz,gl_in[nb].gl_Position.xyz,gl_in[i0].gl_Position.xyz)) { //for front faced switch i0 and i1
            //emit extruded edge
            gl_Position = u_viewProjMat*gl_in[i0].gl_Position;
            EmitVertex();

            gl_Position = u_viewProjMat*vec4(u_light.w*gl_in[i0].gl_Position.xyz - u_light.xyz, 0.0);
            EmitVertex();

            gl_Position = u_viewProjMat*gl_in[i1].gl_Position;
            EmitVertex();

            gl_Position = u_viewProjMat*vec4(u_light.w*gl_in[i1].gl_Position.xyz - u_light.xyz, 0.0);
            EmitVertex();

            EndPrimitive();
        }
    }
    
    //remove below for zpass

    //emit front cap
    gl_Position = u_viewProjMat*gl_in[0].gl_Position;
    EmitVertex();

    gl_Position = u_viewProjMat*gl_in[2].gl_Position;
    EmitVertex();

    gl_Position = u_viewProjMat*gl_in[4].gl_Position;
    EmitVertex();

    EndPrimitive();

    //emit back cap
    gl_Position = u_viewProjMat*vec4(u_light.w*gl_in[4].gl_Position.xyz-u_light.xyz,0.0);
    EmitVertex();

    gl_Position = u_viewProjMat*vec4(u_light.w*gl_in[2].gl_Position.xyz-u_light.xyz,0.0);
    EmitVertex();

    gl_Position = u_viewProjMat*vec4(u_light.w*gl_in[0].gl_Position.xyz-u_light.xyz,0.0);
    EmitVertex();

    EndPrimitive();
}
