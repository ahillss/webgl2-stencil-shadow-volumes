
function Scene(parent,calcFunc) {
    if(parent) {
        parent.nodes.push(this);
    }
    
    this.parent=parent;
    this.calcFunc=calcFunc?calcFunc:(()=>{});
    this.calcd=false;
    this.mat=mat4.create();
    this.nodes=[];
    this.callbacks=[];
}

Scene.prototype.callback = function(func) {
    this.callbacks.push(func);
    return this;
};

Scene.prototype.calc = function() {
    this.calcd=true;
    this.calcFunc(this);

    for(var i=0;i<this.callbacks.length;i++) {
        this.callbacks[i](this.mat);
    }
    
    for(var i=0;i<this.nodes.length;i++) {
        this.nodes[i].calc();
    }
};


Scene.prototype.clear = function() {
    if(this.calcd) {
        for(var i=0;i<this.nodes.length;i++) {
            this.nodes[i].clear();
        }
    }
        
    this.calcd=false;
};

Scene.prototype.identity = function() {
    return new Scene(this,(node)=>{
        mat4.copy(node.mat, node.parent.mat);
    });
};


Scene.prototype.from = function(x) {
    return new Scene(this,(node)=>{
        mat4.multiply(node.mat, node.parent.mat, x);
    });
};


Scene.prototype.translate = function(x) {
    return new Scene(this,(node)=>{
         mat4.translate(node.mat, node.parent.mat,x);
    });
};

Scene.prototype.scale = function(x) {
    return new Scene(this,(node)=>{
        mat4.scale(node.mat, node.parent.mat,x);
    });
};

Scene.prototype.axisAngle = function(axisAngle) {
    return new Scene(this,(node)=>{
        mat4.rotate(node.mat, node.parent.mat, axisAngle[3], [axisAngle[0],axisAngle[1],axisAngle[2]]);
    });
};

Scene.prototype.accumulate = function() {
    return new Scene(this,(node)=>{
        mat4.multiply(node.mat, node.parent.mat, node.mat);
    });
};

Scene.prototype.invert = function() {
    return new Scene(this,(node)=>{
        mat4.invert(node.mat,node.parent.mat); 
    });
};

Scene.prototype.child = function() {
    return new Scene(this,(node)=>{
    });
};


Scene.prototype.toMat3 = function() {
    var x=mat3.create();
    
    this.callbacks.push(()=>{
        mat3.fromMat4(x, this.mat);
    });
    
    return x;
};

Scene.prototype.toNormalMat3 = function() {
    var x=mat3.create();
    
    this.callbacks.push(()=>{
        mat3.normalFromMat4(x,this.mat);
    });
    
    return x;
};

