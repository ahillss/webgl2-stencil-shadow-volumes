
function createFreeLookCameraControl(input) {
    return (function(){
        var pos=[0,0,0];
        var pitch=0;
        var yaw=0;
        var vel=[0,0,0];

        var wDown=false;
        var sDown=false;
        var aDown=false;
        var dDown=false;
        var spcDown=false;
        var ctrlDown=false;

        var posInterp=[0,0,0];
        var rotMat=mat3.identity();
        var viewMat=mat4.identity();
        var quat=[0,0,0,1];

        var slow=5;
        var speed=40;
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

            
            quat[0]=Math.sqrt(1+rotMat[0]+rotMat[4]+rotMat[8])*0.5;
            //~ quat.x=(rotMat[7]-rotMat[5]);
            //~ quat.y=(rotMat[2]-rotMat[6]);
            //~ quat.z=(rotMat[1]-rotMat[3]);
            //~ quat.xyz=quat.xyz.div(4*quat.w);
            
            
        }
        
        function calcAccelDir(rotMat,forward,backward,leftward,rightward,upward,downward) {
            var right=vec3.normal(mat3.to_col(rotMat,0));
            var front=vec3.mul(vec3.normal(vec3.to_x0z(mat3.to_col(rotMat,2))),-1);
            var up=[0,1,0];
            var accel=[0,0,0];            
            
            accel=!forward?accel:vec3.add(accel,front);
            accel=!backward?accel:vec3.add(accel,vec3.mul(front,-1));
            accel=!rightward?accel:vec3.add(accel,right);
            accel=!leftward?accel:vec3.add(accel,vec3.mul(right,-1));
            accel=!upward?accel:vec3.add(accel,up);
            accel=!downward?accel:vec3.add(accel,vec3.mul(up,-1));
            
            if(!vec3.eq(accel,0)) {
                accel=vec3.mul(vec3.normal(accel),speed);
            }
            
            return accel;
        }
        

        function onStep(dt) {
            var accel=calcAccelDir(rotMat,wDown,sDown,aDown,dDown,spcDown,ctrlDown);

            if(!vec3.eq(vel,0)) {
                var vl=vec3.length(vel);
                var slow2=Math.min(vl,slow);
                //accel=vec3.add(accel,-0.5*vl*vl);
                //~ x^2=2x
                
                //~ 2x=
                
                
                //accel=vec3.add(accel,vec3.mul(vec3.normal(vel),-vl*0.99));
                //~ console.log(accel);
                
                //~ if(vec3.length(vel)>slow) {
                    //~ vel=[0,0,0];
                //~ } else {
                    //~ vel=vec3.sub(vel,vec3.mul(vec3.normal(vel),slow*dt));
                //~ }
            }
            
            //~ var old_vel=vel.slice();
            vel=vec3.add(vel,vec3.mul(accel,dt));
            vel=vec3.mul(vel,0.95);
            
            
            pos=vec3.add(pos,vec3.mul(vel,dt));
            //~ pos=vec3.add(pos, vec3.mul(vec3.add(old_vel, vel),0.5*dt));
 
            
            //pos+=old_vel*dt-accel*0.5*dt*dt
            //pos+=vel*dt - accel*0.5 * dt * dt



        }

        function onRender(dt,it) {

            //~ var dt2=dt*it;
            
            var accel=calcAccelDir(rotMat,wDown,sDown,aDown,dDown,spcDown,ctrlDown);
            var it2=(1-it);
            var dt2=dt*it;
            //posInterp=vec3.add(pos,vec3.mul(vel,dt2)
            //~ , vec3.mul(accel,dt*dt*it2*it2)
            //);
            
            //~ var old_vel=vel.slice();
            var vel2=vec3.add(vel,vec3.mul(accel,dt));
            vel2=vec3.mul(vel2,0.95);
            
            posInterp= vec3.interp(pos, vec3.add(pos, vec3.mul(vel2,dt)), it);
            
            //~ posInterp= vec3.interp(pos, vec3.add(pos, vec3.mul(vec3.add(old_vel, vel2),0.5*dt)), it);
            
            //~ posInterp=pos2.clone();
            
            //~ posInterp=pos.slice();
            
            viewMat[12]=-vec3.dot(posInterp,mat3.to_col(rotMat,0));
            viewMat[13]=-vec3.dot(posInterp,mat3.to_col(rotMat,1));
            viewMat[14]=-vec3.dot(posInterp,mat3.to_col(rotMat,2));
            
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

            "getPos" : (function(){return posInterp.slice()}),
            //~ "getPos" : (function(){return [0,0,0];}),
            "setPos" : (function(x,y,z){pos[0]=x;pos[1]=y;pos[2]=z;}),
            "getRot" : (function(){return rotMat.slice();}),
            //~ "getRot" : (function(){return [1,0,0, 0,1,0, 0,0,1];}),
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
}

