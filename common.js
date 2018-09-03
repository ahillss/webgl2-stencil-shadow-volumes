
var getTime=(()=>{var start;return(()=>{start=start||Date.now();return((Date.now()-start)/1000)%3.402823e+38;});})();

var calcFPS=(()=>{var c=0,x=0.0,la=0.0;return(()=>{var cu=Date.now()/1000.0;if(la==0.0){la=cu;}var dt=cu-la;if(dt>=1.0){x=c/dt;c=0;la=cu;}c++;return x;});})();

var fixedTimeStep=(()=>{var st=1.0/30.0,ac;return((cu,A,B)=>{var c=0;ac=ac||cu;while(ac+st<=cu){c+=1;ac+=st;A(st);ac=(c==5)?cu:ac;}B(st,(cu-ac)/st);});})();


function setErrorMsg(msg) {
    var root=document.getElementById("root");
    root.innerHTML=hasError?root.innerHTML:'';
    hasError=true;
    root.innerHTML+='<pre>'+msg.replace("\n","<br/>");+'</pre>';
}

var addLog=(function(){
    var logElement; return (function(msg){
        logElement=logElement||document.getElementById("log");
        var m=document.createElement('span');
        m.innerHTML=msg.replace("\n","<br/>");
        var e=document.createElement('span');
        logElement.appendChild(document.createElement('br'));
        logElement.appendChild(m);
        logElement.appendChild(e);
        return (function bla(x){e.innerHTML=x.replace("\n","<br/>");return bla});
    });
})();


function log(msg) {
    var textarea = document.getElementById("log");
    textarea.innerHTML += String(msg).replace(/\n/g,"<br />") + "<br />";
}

var updateBarFps=(function(){
    var element; return (function(x){
        element=element||document.getElementById("barFps");
        element.innerHTML = x.toFixed(1)  + " fps";
    });
})();

var updateBarTime=(function(){
    var element; return (function(x){
        element=element||document.getElementById("barTime");
        element.innerHTML = x.toFixed(2);
    });
})();

window.onresize=(function(){window.scrollTo(0,0);});

window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (function(c,e){window.setTimeout(c,1000/60)});

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;


window.onload=onInit;