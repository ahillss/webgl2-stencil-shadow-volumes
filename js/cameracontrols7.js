
var createFreeLookCameraControl;

(function(){
    function vec3_dot(a,b) {
        return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
    }

    function vec3_length(v) {
        return Math.sqrt(vec3_dot(v,v));
    }

    function vec3_normal(out,v) {
        var l=1/vec3_length(v);
        out[0]=v[0]*l;
        out[1]=v[1]*l;
        out[2]=v[2]*l;
    }

    createFreeLookCameraControl=createFreeLookCameraControl||(function(input) {
        return (function(){
            var pos=vec3.fromValues(0,0,0);
            var pitch=0;
            var yaw=0;
            var vel=vec3.fromValues(0,0,0);
            
            console.log(vector.create([1,2,3]).normal());

            var wDown=false;
            var sDown=false;
            var aDown=false;
            var dDown=false;
            var spcDown=false;
            var ctrlDown=false;

            var posInterp=vec3.fromValues(0,0,0);
            var rotMat=mat3.Identity()
            var viewMat=[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
            var quat=[0,0,0,1];

            var slow=0.92;
            var speed=0.01;
            var lookSpeed=0.005;
            
            if(input && input["pos"]) {
                pos[0]=input["pos"][0];
                pos[1]=input["pos"][1];
                pos[2]=input["pos"][2];
            }
            
            if(input && input["yaw"]) {
                yaw=input["yaw"];
            }
            if(input && input["pitch"]) {
                pitch=input["pitch"];
            }
            
            if(input && input["speed"]) {
                speed=input["speed"];
            }
            if(input && input["slow"]) {
                slow=input["slow"];
            }
            if(input && input["lookSpeed"]) {
                lookSpeed=input["lookSpeed"];
            }

            function onUpdate() {
                var sx=Math.sin(pitch);
                var sy=Math.sin(yaw);
                var cx=Math.cos(pitch);
                var cy=Math.cos(yaw);
                
                rotMat[0]=cy;
                rotMat[1]=0;
                rotMat[2]=-sy;
                rotMat[3]=sy*sx;
                rotMat[4]=cx;
                rotMat[5]=cy*sx;
                rotMat[6]=sy*cx;
                rotMat[7]=-sx;
                rotMat[8]=cy*cx;
                                
                viewMat[0]=rotMat[0];         
                viewMat[1]=rotMat[3]; 
                viewMat[2]=rotMat[6]; 
                viewMat[4]=rotMat[1]; 
                viewMat[5]=rotMat[4]; 
                viewMat[6]=rotMat[7]; 
                viewMat[8]=rotMat[2]; 
                viewMat[9]=rotMat[5]; 
                viewMat[10]=rotMat[8];
                
                quat[3]=Math.sqrt(1+rotMat[0]+rotMat[4]+rotMat[8])/2;
                quat[0]=(rotMat[7]-rotMat[5])/(4*quat[3]);
                quat[1]=(rotMat[2]-rotMat[6])/(4*quat[3]);
                quat[2]=(rotMat[1]-rotMat[3])/(4*quat[3]);
            }
            

            function onStep(dt) {
                var right=vec3.fromValues(rotMat[0],0,rotMat[2]).normal();
                var back=vec3.fromValues(rotMat[6],0,rotMat[8]).normal();
                var up=vec3.fromValues(0,1,0);               
                var accel=vec3.fromValues(0,0,0);
                
                accel=!wDown?accel:back.mul(-1).add(accel);
                accel=!sDown?accel:back.mul(1).add(accel);
                accel=!aDown?accel:right.mul(-1).add(accel);
                accel=!dDown?accel:right.mul(1).add(accel);
                accel=!spcDown?accel:up.mul(1).add(accel);
                accel=!ctrlDown?accel:up.mul(-1).add(accel);
                accel=accel.normal().mul(speed);
                
                var old_vel=vel.copy();
                vel.add_set(accel.mul(dt));
                vel.sub_set(vel.mul(slow*dt));
                pos.add_set(old_vel.add(vel).mul(0.5 * dt));
                
                //~ pos.add_set(old_vel.mul(dt).sub(accel.mul(0.5*dt*dt)));
                //~ pos.add_set(vel.mul(dt).sub(accel.mul(0.5 * dt * dt)));



            }

            function onRender(dt,it) {
 
                var dt2=dt*it;
                
                var right=vec3.fromValues(rotMat[0],0,rotMat[2]).normal();
                var back=vec3.fromValues(rotMat[6],0,rotMat[8]).normal();
                var up=vec3.fromValues(0,1,0);               
                var accel=vec3.fromValues(0,0,0);
                
                accel=!wDown?accel:back.mul(-1).add(accel);
                accel=!sDown?accel:back.mul(1).add(accel);
                accel=!aDown?accel:right.mul(-1).add(accel);
                accel=!dDown?accel:right.mul(1).add(accel);
                accel=!spcDown?accel:up.mul(1).add(accel);
                accel=!ctrlDown?accel:up.mul(-1).add(accel);
                accel=accel.normal().mul(speed);
                
                var old_vel=vel.copy();

                var vel2=vel.copy();
                var pos2=pos.copy();
                
                vel2.add_set(accel.mul(dt2));
                vel2.sub_set(vel2.mul(slow*dt2));
                pos2.add_set(old_vel.add(vel2).mul(0.5 * dt2));
                
                //~ pos.add_set(old_vel.mul(dt).sub(accel.mul(0.5*dt*dt)));
                //~ pos.add_set(vel.mul(dt).sub(accel.mul(0.5 * dt * dt)));
                posInterp.set(pos2);
                
                viewMat[12]=-vec3_dot(posInterp,[rotMat[0],rotMat[1],rotMat[2]]);
                viewMat[13]=-vec3_dot(posInterp,[rotMat[3],rotMat[4],rotMat[5]]);
                viewMat[14]=-vec3_dot(posInterp,[rotMat[6],rotMat[7],rotMat[8]]);
                
            }

            function onKeyDown(event) {
                if(event.key=="w") {
                    wDown=true;
                } else if(event.key=="s") {
                    sDown=true;
                } else if(event.key=="a") {
                    aDown=true;
                } else if(event.key=="d") {
                    dDown=true;
                } else if(event.key=="e") {
                    spcDown=true;
                } else if(event.key=="q") {
                    ctrlDown=true;
                }
            }

            function onKeyUp(event) {
                if(event.key=="w") {
                    wDown=false;
                } else if(event.key=="s") {
                    sDown=false;
                } else if(event.key=="a") {
                    aDown=false;
                } else if(event.key=="d") {
                    dDown=false;
                } else if(event.key=="e") {
                    spcDown=false;
                } else if(event.key=="q") {
                    ctrlDown=false;
                }
            }

            function onMouseMove(event) {
                yaw-=event.movementX*lookSpeed;
                pitch-=event.movementY*lookSpeed;
                pitch=Math.min(Math.max(pitch,-1.57),1.57);
            }

            return {
                "update" : onUpdate,
                "step" : onStep,
                "render" : onRender,
                "keydown" : onKeyDown,
                "keyup" : onKeyUp,
                "mousemove" : onMouseMove,

                "getPos" : (function(){return [0,5,-5];}),
                "getRot" : (function(){return [1,0,0, 0,1,0, 0,0,-1];}),
                
                //~ "getPos" : (function(){return posInterp.slice()}),
                "setPos" : (function(x,y,z){pos[0]=x;pos[1]=y;pos[2]=z;}),
                //~ "getRot" : (function(){return rotMat.toArray();}),
                "getQuat" : (function(){return quat.slice();}),

                "setSlow":(function(x){slow=x;}),
                "setSpeed":(function(x){speed=x;}),
                "setLookSpeed":(function(x){lookSpeed=x;}),

                "setPitch":(function(x){pitch=x;}),
                "getPitch" : (function(){return pitch;}),

                "setYaw":(function(x){yaw=x;}),
                "getYaw" : (function(){return yaw;}),
                
                "getView" :(function(){return viewMat.slice();}),
            };
        })();
    });
})();
