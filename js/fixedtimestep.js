
function createFixedTimeStep(stepTime,maxSteps) {
    return (function(){
        var accumTime;
        
        return (function(curTime,onStep,onInterp){
           var steps=0;
            accumTime=accumTime||curTime;
            
            while(accumTime+stepTime<=curTime) {
                steps+=1;
                accumTime+=stepTime;
                onStep(stepTime);
                
                if(steps==maxSteps) {
                    accumTime=curTime;
                }
            }
            
            var interpTime=(curTime-accumTime)/stepTime;
            onInterp(stepTime,interpTime);
        });
    })();
}