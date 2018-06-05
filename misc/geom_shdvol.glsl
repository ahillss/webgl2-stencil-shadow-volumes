[vertex_shader]

#version 440

layout(location = 0) in vec3 a_pos;

uniform mat4 u_modelMat;

out int vertexID;

void main() {
    vertexID=gl_VertexID;
    gl_Position=u_modelMat*vec4(a_pos,1.0);
}

[geometry_shader_point_light]

/*
 * point light, backfaced, zfail, infinite
 * can be converted for front faced and zpass by following notes in comments
 * expects vertex at index 0 to represent no adjacency (aka a hole in the mesh)
 * light pos is in world space
 */
 
#version 440

layout(triangles_adjacency) in;
layout(triangle_strip, max_vertices=18) out; //12 for zpass

in int vertexID[];

uniform mat4 u_viewProjMat;
uniform vec3 u_lightPos;

bool isFaceLit(vec3 v0, vec3 v1, vec3 v2) {
    vec3 n=cross(v1-v0,v2-v0);
    vec3 d0 = u_lightPos-v0;
    vec3 d1 = u_lightPos-v1;
    vec3 d2 = u_lightPos-v2;
    return (dot(n,d0)<0.0 || dot(n,d1)<0.0 || dot(n,d2)<0.0); //for front faced use '>'
}

void main() {
    if(!isFaceLit(gl_in[0].gl_Position.xyz,gl_in[2].gl_Position.xyz,gl_in[4].gl_Position.xyz)) {
        return;
    }

    for(int i=0; i<3; i++) {
        int i0 = i*2;
        int nb = (i*2+1);
        int i1 = (i*2+2) % 6;

        if(vertexID[nb]==0 || !isFaceLit(gl_in[i0].gl_Position.xyz,gl_in[nb].gl_Position.xyz,gl_in[i1].gl_Position.xyz)) {

            //emit side quad
            gl_Position = u_viewProjMat*gl_in[i0].gl_Position;
            EmitVertex();

            gl_Position = u_viewProjMat*vec4(v0.xyz - u_lightPos, 0.0);
            EmitVertex();

            gl_Position = u_viewProjMat*gl_in[i1].gl_Position;
            EmitVertex();

            gl_Position = u_viewProjMat*vec4(v2.xyz - u_lightPos, 0.0);
            EmitVertex();

            EndPrimitive();
        }
    }

    //for zpass remove code below

    //emit front cap
    gl_Position = u_viewProjMat*gl_in[0].gl_Position;
    EmitVertex();

    gl_Position = u_viewProjMat*gl_in[2].gl_Position;
    EmitVertex();

    gl_Position = u_viewProjMat*gl_in[4].gl_Position;
    EmitVertex();

    EndPrimitive();

    //emit back cap
    gl_Position = u_viewProjMat*vec4(gl_in[4].gl_Position.xyz-u_lightPos,0.0);
    EmitVertex();

    gl_Position = u_viewProjMat*vec4(gl_in[2].gl_Position.xyz-u_lightPos,0.0);
    EmitVertex();

    gl_Position = u_viewProjMat*vec4(gl_in[0].gl_Position.xyz-u_lightPos,0.0);
    EmitVertex();

    EndPrimitive();
}

[geometry_shader_dirlight]

/*
 * directional light, backfaced, zfail, infinite
 * can be converted for front faced and zpass by following notes in comments
 * expects vertex at index 0 to represent no adjacency (aka a hole in the mesh)
 * light dir is in world space
 */

#version 440

layout(triangles_adjacency) in;
layout(triangle_strip, max_vertices=12) out; //9 for zpass

in int vertexID[];

uniform mat4 u_viewProjMat;
uniform vec3 u_lightDir;

bool isFaceLit(vec3 v0, vec3 v1, vec3 v2) {
    vec3 n=cross(v1-v0,v2-v0);
    return (dot(n,u_lightDir)>0.0); //for front faced use '<'
}

void main() {
    if(!isFaceLit(gl_in[0].gl_Position.xyz,gl_in[2].gl_Position.xyz,gl_in[4].gl_Position.xyz)) {
        return;
    }

    for(int i=0; i<3; i++) {
        int i0 = i*2;
        int nb = (i*2+1);
        int i1 = (i*2+2) % 6;

        if(vertexID[nb]==0 || !isFaceLit(gl_in[i0].gl_Position.xyz,gl_in[nb].gl_Position.xyz,gl_in[i1].gl_Position.xyz)) {
            //emit side
            gl_Position = u_viewProjMat*gl_in[i0].gl_Position;
            EmitVertex();

            gl_Position = u_viewProjMat*vec4(u_lightDir, 0.0);
            EmitVertex();

            gl_Position = u_viewProjMat*gl_in[i1].gl_Position;
            EmitVertex();

            EndPrimitive();
        }
    }

    //for zpass remove code below

    //emit front cap
    gl_Position = u_viewProjMat*gl_in[0].gl_Position;
    EmitVertex();

    gl_Position = u_viewProjMat*gl_in[2].gl_Position;
    EmitVertex();

    gl_Position = u_viewProjMat*gl_in[4].gl_Position;
    EmitVertex();

    EndPrimitive();
}