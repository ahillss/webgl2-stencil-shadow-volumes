
function createFpsCounter(){
    return (function(){
        var count=0;
        var total=0.0;
        var last=0.0;
        
        return (function(){
            var cur=Date.now()/1000.0;
            
            if(last==0.0) {
                last=cur;
            }
            
            var dt=cur-last;

            if(dt>=1.0) {
                total=count/dt;
                count=0;
                last=cur;
            }

            count++;
            return total;
        });
    })();
};