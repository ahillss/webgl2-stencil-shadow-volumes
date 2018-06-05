
function createFreeLookCameraControl(input) {
    return (function(){
        var pos=[0,0,0];
        var pitch=0;
        var yaw=0;
        var vel=[0,0,0];
        var accel=[0,0,0];

        var forward=false;
        var backward=false;
        var leftward=false;
        var rightward=false;
        var upward=false;
        var downward=false;

        var posInterp=[0,0,0];
        var rotMat=[1,0,0, 0,1,0, 0,0,1];
        var viewMat=new Array(16);
        var quat=[0,0,0,1];

        var slow=5;
        var speed=40;
        var lookSpeed=0.005;
        
        pos=("pos" in input)?input["pos"].slice():pos;
        yaw=("yaw" in input)?input["yaw"]:yaw;
        pitch=("pitch" in input)?input["pitch"]:pitch;
        speed=("speed" in input)?input["speed"]:speed;
        slow=("slow" in input)?input["slow"]:slow;
        lookSpeed=("lookSpeed" in input)?input["lookSpeed"]:lookSpeed;
        

        function onUpdate() {
            var sx=Math.sin(pitch);
            var sy=Math.sin(yaw);
            var cx=Math.cos(pitch);
            var cy=Math.cos(yaw);
            
            rotMat=[cy,0,-sy,sy*sx,cx,cy*sx,sy*cx,-sx,cy*cx];
            
            var right=rotMat.slice(0,3);
            var back=rotMat.slice(6,9);
            
            accel=[0,0,0];
            
            accel[0]+=((forward?-1:0)+(backward?1:0))*back[0];
            accel[1]+=((forward?-1:0)+(backward?1:0))*back[1];
            accel[2]+=((forward?-1:0)+(backward?1:0))*back[2];
            
            accel[0]+=((leftward?-1:0)+(rightward?1:0))*right[0];
            accel[1]+=((leftward?-1:0)+(rightward?1:0))*right[1];
            accel[2]+=((leftward?-1:0)+(rightward?1:0))*right[2];

            accel[1]+=(upward?-1:0)+(downward?1:0);
            
            accel[0]*=speed;
            accel[1]*=speed;
            accel[2]*=speed;
        }
        

        function onStep(dt) {
            vel[0]+=accel[0]*dt;
            vel[1]+=accel[1]*dt;
            vel[2]+=accel[2]*dt;
            
            //~ vel[0]*=0.95
            //~ vel[1]*=0.95;
            //~ vel[2]*=0.95;
            
            pos[0]+=vel[0]*dt;
            pos[1]+=vel[1]*dt;
            pos[2]+=vel[2]*dt;
            
            viewMat=[
                rotMat[0],rotMat[3],rotMat[6],0,
                rotMat[1],rotMat[4],rotMat[7],0,
                rotMat[2],rotMat[5],rotMat[8],0,
                
                -(pos[0]*rotMat[0]+pos[1]*rotMat[1]+pos[2]*rotMat[2]),
                -(pos[0]*rotMat[3]+pos[1]*rotMat[4]+pos[2]*rotMat[5]),
                -(pos[0]*rotMat[6]+pos[1]*rotMat[7]+pos[2]*rotMat[8]),
                1];
                
        }

        function onRender(dt,it) {

            //~ var dt2=dt*it;
            
            var accel=calcAccelDir(rotMat,forward,backward,leftward,rightward,upward,downward);
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
                forward=true;
            } else if(event.key=="s") {
                backward=true;
            } else if(event.key=="a") {
                leftward=true;
            } else if(event.key=="d") {
                rightward=true;
            } else if(event.key=="e") {
                upward=true;
            } else if(event.key=="q") {
                downward=true;
            }
        }

        function onKeyUp(event) {
            if(event.key=="w") {
                forward=false;
            } else if(event.key=="s") {
                backward=false;
            } else if(event.key=="a") {
                leftward=false;
            } else if(event.key=="d") {
                rightward=false;
            } else if(event.key=="e") {
                upward=false;
            } else if(event.key=="q") {
                downward=false;
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

            //~ "getPos" : (function(){return posInterp.slice()}),
            //~ "getPos" : (function(){return [0,0,0];}),
            "setPos" : (function(x,y,z){pos[0]=x;pos[1]=y;pos[2]=z;}),
            "getRot" : (function(){return rotMat.slice();}),
            //~ "getRot" : (function(){return [1,0,0, 0,1,0, 0,0,1];}),
            //~ "getQuat" : (function(){return quat.slice();}),

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

