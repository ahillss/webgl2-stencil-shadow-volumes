
function calcTriangleArea(p0,p1,p2) {
    var e0=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]]; //p1-p0
    var e1=[p2[0]-p0[0],p2[1]-p0[1],p2[2]-p0[2]]; //p2-p0
    var c=[e0[1]*e1[2]-e0[2]*e1[1],e0[2]*e1[0]-e0[0]*e1[2],e0[0]*e1[1]-e0[1]*e1[0]];//cross(e0,e1)
    var d=c[0]*c[0]+c[1]*c[1]+c[2]*c[2]; //dot(c,c)
    return Math.sqrt(d)*0.5;
}

function removeTinyTriangles(verts,inds,minArea=1.0e-5) {
    var indsOut=[];
    
    for(var i=0;i<inds.length/3;i++) {
        var ind0=inds[i*3+0];
        var ind1=inds[i*3+1];
        var ind2=inds[i*3+2];

        var v0=[verts[ind0*3],verts[ind0*3+1],verts[ind0*3+2]];
        var v1=[verts[ind1*3],verts[ind1*3+1],verts[ind1*3+2]];
        var v2=[verts[ind2*3],verts[ind2*3+1],verts[ind2*3+2]];

        if(calcTriangleArea(v0,v1,v2)<minArea) {
            continue;
        }
        
        indsOut.push(ind0);
        indsOut.push(ind1);
        indsOut.push(ind2);
    }
    
    return indsOut;
}

function roundVerts(verts,places=10) {
    verts=verts.slice();
    var p=Math.pow(10, places);
    
    for(var i=0;i<verts.length;i++) {
        verts[i]=Math.round(verts[i]*p)/p;
    }
    
    return verts;
}

function removeDuplVerts(verts,inds, prependVerts=[]) {
    var indsByVert={};
    var vertsOut=prependVerts.slice();
    
    for(var i=0;i<inds.length;i++) {
        var vert=[verts[inds[i]*3+0],verts[inds[i]*3+1],verts[inds[i]*3+2]];
        var key=vert[0]+" "+vert[1]+" "+vert[2];
      
        if(!(key in indsByVert)) {
            indsByVert[key]=vertsOut.length/3;
            vertsOut.push(vert[0]);
            vertsOut.push(vert[1]);
            vertsOut.push(vert[2]);
        }
        
        inds[i]=indsByVert[key];
    }
    
    //
    return vertsOut;
}

function cleanVertsInds(verts,inds) {
    inds=removeTinyTriangles(verts,inds);
    verts=roundVerts(verts);
    verts=removeDuplVerts(verts,inds);
    return {"vertices":verts,"indices":inds};
}

function generateSideVertsInds(verts,inds) {
    //get edges
    var edges={}; //key : [ind0,ind1,halfEdges0,halfEdges1]
    
    for(var i=0;i<inds.length/3;i++) {
        var ind0=inds[i*3+0];
        var ind1=inds[i*3+1];
        var ind2=inds[i*3+2];
        
        var edgeInds0=(ind0<ind1)?[ind0,ind1]:[ind1,ind0];
        var edgeInds1=(ind1<ind2)?[ind1,ind2]:[ind2,ind1];
        var edgeInds2=(ind2<ind0)?[ind2,ind0]:[ind0,ind2];
        
        var key0=edgeInds0[0]+" "+edgeInds0[1];
        var key1=edgeInds1[0]+" "+edgeInds1[1];
        var key2=edgeInds2[0]+" "+edgeInds2[1];
        
        edges[key0]=(key0 in edges)?edges[key0]:[...edgeInds0,[],[]];
        edges[key1]=(key1 in edges)?edges[key1]:[...edgeInds1,[],[]];
        edges[key2]=(key2 in edges)?edges[key2]:[...edgeInds2,[],[]];
        
        ((ind0<ind1)?edges[key0][2]:edges[key0][3]).push(ind2);
        ((ind1<ind2)?edges[key1][2]:edges[key1][3]).push(ind0);
        ((ind2<ind0)?edges[key2][2]:edges[key2][3]).push(ind1);
    }
    
    //
    var vertsOut=[];
    
    var indsOut=[];
    
    var todo=[];
    
    var lineIndsOut=[];
    
    //console.log(edges);

    for(var i in edges) {
        var ind0=edges[i][0];
        var ind1=edges[i][1];
        
        var halfEdges0=edges[i][2];
        var halfEdges1=edges[i][3];
        
        
        if(halfEdges0.length ==1 && halfEdges1.length==1) {
            var adjInd0=halfEdges0[0];
            var adjInd1=halfEdges1[0];
            todo.push([ind0,ind1,adjInd0,adjInd1]);
            todo.push([ind1,ind0,adjInd1,adjInd0]);
        } else {
            for(var j=0;j<halfEdges0.length;j++) {
                var adjInd0=halfEdges0[j];
                var adjInd1=adjInd0;
                //console.log(adjInd0);
                todo.push([ind0,ind1,adjInd0,adjInd1]);
                
                //~ todo.push([ind1,ind0,adjInd1,adjInd0]);
            }
            
            for(var j=0;j<halfEdges1.length;j++) {
                var adjInd1=halfEdges1[j];
                var adjInd0=adjInd1;
                //console.log(adjInd1);
                todo.push([ind1,ind0,adjInd1,adjInd0]);
                
                //~ todo.push([ind0,ind1,adjInd0,adjInd1]);
            }
        }                
    }
    
    //console.log(todo);
    
    for(var i=0;i<todo.length;i++) {
        var ind0=todo[i][0];
        var ind1=todo[i][1];
        var adjInd0=todo[i][2];
        var adjInd1=todo[i][3];
        
        //console.log(todo);
        
        var vert0=verts.slice(ind0*3,ind0*3+3);
        var vert1=verts.slice(ind1*3,ind1*3+3);
        var adjVert0=verts.slice(adjInd0*3,adjInd0*3+3);
        var adjVert1=verts.slice(adjInd1*3,adjInd1*3+3);
        
        //console.log(adjInd0,adjInd1);
        //console.log(vert0,vert1,adjVert0,adjVert1);
        
        for(var j=0;j<4;j++) {
            vertsOut.push(...vert0);
            vertsOut.push(...vert1);
            vertsOut.push(...adjVert0);
            vertsOut.push(...adjVert1);
        }
    }
    
    for(var i=0;i<todo.length;i++) {
        indsOut.push(...[i*4+0,i*4+2,i*4+1, i*4+1,i*4+2,i*4+3]);
        lineIndsOut.push(...[i*4+0,i*4+2, i*4+1,i*4+3]);
    }
    
    return {"vertices":vertsOut,"indices":indsOut,"line_indices":lineIndsOut};
    
}
function generateCapVertsInds(verts,inds) {
    var vertsOut=[];
    
    var indsOut=[];
    var lineIndsOut=[];
    
    for(var i=0;i<inds.length/3;i++) {
        var ind0=inds[i*3+0];
        var ind1=inds[i*3+1];
        var ind2=inds[i*3+2];
        
        var vert0=[verts[ind0*3+0],verts[ind0*3+1],verts[ind0*3+2]];
        var vert1=[verts[ind1*3+0],verts[ind1*3+1],verts[ind1*3+2]];
        var vert2=[verts[ind2*3+0],verts[ind2*3+1],verts[ind2*3+2]];
        
        for(var j=0;j<2;j++) {
            vertsOut.push(...vert0);
            vertsOut.push(...vert1);
            vertsOut.push(...vert2);
        }
            
        for(var j=0;j<2;j++) {
            vertsOut.push(...vert1);
            vertsOut.push(...vert2);
            vertsOut.push(...vert0);
        }
            
        for(var j=0;j<2;j++) {
            vertsOut.push(...vert2);
            vertsOut.push(...vert0);
            vertsOut.push(...vert1);
        }
    }
    
    for(var i=0;i<inds.length/3;i++) {
        indsOut.push(...([i*3+0,i*3+1,i*3+2].map(x=>x*2+0)));
        lineIndsOut.push(...([i*3+0,i*3+1, i*3+1,i*3+2, i*3+2,i*3+0].map(x=>x*2+0)));
    }

    for(var i=0;i<inds.length/3;i++) {
        indsOut.push(...([i*3+2,i*3+1,i*3+0].map(x=>x*2+1)));
        lineIndsOut.push(...([i*3+0,i*3+1, i*3+1,i*3+2, i*3+2,i*3+0].map(x=>x*2+1)));
    }
    
    return {"vertices":vertsOut,"indices":indsOut,"line_indices":lineIndsOut};
}