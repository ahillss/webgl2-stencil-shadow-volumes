
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

function generateTriangleAdjacencies(verts,inds,noadjInd=0) {
    //get half edges
    var halfEdges={};
    
    for(var i=0;i<inds.length/3;i++) {
        var ind0=inds[i*3+0];
        var ind1=inds[i*3+1];
        var ind2=inds[i*3+2];

        var key0=ind0+" "+ind1;
        var key1=ind1+" "+ind2;
        var key2=ind2+" "+ind0;
                
        halfEdges[key0]=(key0 in halfEdges)?halfEdges[key0]:[];
        halfEdges[key1]=(key1 in halfEdges)?halfEdges[key1]:[];
        halfEdges[key2]=(key2 in halfEdges)?halfEdges[key2]:[];
        
        halfEdges[key0].push(ind2);
        halfEdges[key1].push(ind0);
        halfEdges[key2].push(ind1);
    }
    
    //get adjacencies
    var adjInds=[];

    for(var i=0;i<inds.length/3;i++) {
        var ind0=inds[i*3+0];
        var ind1=inds[i*3+1];
        var ind2=inds[i*3+2];

        var oth0=halfEdges[ind1+" "+ind0]||[];
        var oth1=halfEdges[ind2+" "+ind1]||[];
        var oth2=halfEdges[ind0+" "+ind2]||[];
        
        var cur0=halfEdges[ind0+" "+ind1]||[];
        var cur1=halfEdges[ind1+" "+ind2]||[];
        var cur2=halfEdges[ind2+" "+ind0]||[];
        
        adjInds.push(inds[i*3+0]);
        adjInds.push((oth0.length==1 && cur0.length==1)?oth0[0]:noadjInd);
        adjInds.push(inds[i*3+1]);
        adjInds.push((oth1.length==1 && cur1.length==1)?oth1[0]:noadjInd);
        adjInds.push(inds[i*3+2]);
        adjInds.push((oth2.length==1 && cur2.length==1)?oth2[0]:noadjInd);
    }
    
    //
    return adjInds;
}

function setupShdVertsInds(verts,inds) {
    inds=removeTinyTriangles(verts,inds);
    verts=roundVerts(verts);
    verts=removeDuplVerts(verts,inds,[0,0,0]);
    inds=generateTriangleAdjacencies(verts,inds);
    return {"vertices":verts,"indices":inds};
}