function shadertoyMouseInput(element) {
    return (function(){
        var cursor=[0,0,0,0],lmb=false;
        function onStart(q){
            var rect=element.getBoundingClientRect();
            cursor[0]=cursor[2]=q.clientX-rect.left;
            cursor[1]=cursor[3]=rect.bottom-q.clientY;
        }
        function onMove(q){
            var rect=element.getBoundingClientRect();
            cursor[0]=q.clientX-rect.left;
            cursor[1]=rect.bottom-q.clientY;
        }
        function onStop(q){
            cursor[2]*=-1;
            cursor[3]*=-1;
        }
        element.addEventListener("mousedown",function(event){
            if(event.button==0){lmb=true;onStart(event);}
        });
        element.addEventListener("mousemove",function(event){
            if(lmb){onMove(event);}
        });
        window.addEventListener("mouseup",function(event){
            if(event.button==0&&lmb){lmb=false;onStop();}
        });
        element.addEventListener('touchstart',function(event){
            event.preventDefault();
            onStart(event.targetTouches[0]);
        });
        element.addEventListener('touchmove',function(event){
            event.preventDefault();
            onMove(event.targetTouches[0]);
        });
        element.addEventListener('touchend',function(event){
            event.preventDefault();
            onStop();
        });
        element.addEventListener('touchcancel',function(event){
            event.preventDefault();
            onStop();
        });
        return cursor;
    })();
}

function mouseScrollInput(element) {
    return (function(){
        var scroll=[0,0];

        element.addEventListener("wheel", (function(event){
            scroll[0]=event.deltaY;
            scroll[1]=event.deltaX;
        }));

        return scroll;
    })();
}

function pinchInput(element) {
    return (function(){
        var ok=false;
        var lx,ly,lx2,ly2;
        var scroll=[0,0];

        element.addEventListener('touchmove', (function(event) {
            event.preventDefault();

            if(event.targetTouches.length == 2) {
                var mx=ok?(event.targetTouches[0].clientX-lx):0;
                var my=ok?(event.targetTouches[0].clientY-ly):0;
                var mx2=ok?(event.targetTouches[1].clientX-lx2):0;
                var my2=ok?(event.targetTouches[1].clientY-ly2):0;

                var x=0,t=0;
                x+=(mx>0 && mx2 <0)?-1:0;
                x+=(mx<0 && mx2 >0)?1:0;
                x*=(event.targetTouches[0].clientX<event.targetTouches[1].clientX)?-1:1;

                t+=(my>0 && my2 <0)?-1:0;
                t+=(my<0 && my2 >0)?1:0
                t*=(event.targetTouches[0].clientY<event.targetTouches[1].clientY)?-1:1;

                scroll[0]=x*Math.abs(mx-mx2)* 2;
                scroll[1]=t*Math.abs(my-my2)* -2;

                lx=event.targetTouches[0].clientX;
                ly=event.targetTouches[0].clientY;
                lx2=event.targetTouches[1].clientX;
                ly2=event.targetTouches[1].clientY;
                ok=true;
            }
        }));

        element.addEventListener('touchend', (function(event){ok=false;}));
        element.addEventListener('touchcancel', (function(event){ok=false;}));

        return scroll;
    })();
}

function panInput(element) {
    return (function(){
        var ok=false;
        var lx,ly,lx2,ly2;
        var scroll=[0,0];

        element.addEventListener('touchmove', (function(event) {
            event.preventDefault();

            if(event.targetTouches.length == 2) {
                var mx=ok?(event.targetTouches[0].clientX-lx):0;
                var my=ok?(event.targetTouches[0].clientY-ly):0;
                var mx2=ok?(event.targetTouches[1].clientX-lx2):0;
                var my2=ok?(event.targetTouches[1].clientY-ly2):0;

                var x=(Math.sign(mx)==Math.sign(mx2))?(mx+my)/2:0
                var y=(Math.sign(my)==Math.sign(my2))?(my+my)/2:0

                scroll[0]=x;
                scroll[1]=y;
                
                lx=event.targetTouches[0].clientX;
                ly=event.targetTouches[0].clientY;
                lx2=event.targetTouches[1].clientX;
                ly2=event.targetTouches[1].clientY;
                ok=true;
            }
        }));

        element.addEventListener('touchend', (function(event){ok=false;}));
        element.addEventListener('touchcancel', (function(event){ok=false;}));

        return scroll;
    })();
}