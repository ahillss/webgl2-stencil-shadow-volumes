
function loadText(url) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = (function() {
            if (req.status == 200) {
                resolve(req.response);
            } else {
                reject(req.statusText);
            }
        });

        req.onerror = (function() {
            reject("Network Error");
        });

        req.send();
    });
}
 
  function loadBinary(url,progress) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.responseType = "arraybuffer";
        req.addEventListener("progress", (evt)=>{progress(evt.loaded / evt.total);});

        req.onload = (function() {
            if (req.status == 200) {
                resolve(req.response);
            } else {
                reject(req.statusText);
            }
        });

        req.onerror = (function() {
            reject("Network Error");
        });

        req.send();
    });
}

function loadImage(fn) {
    return new Promise(function (resolve, reject) {
        var image = new Image();
        image.src = fn;

        image.onload = (function(image) {
            return (function() {
                resolve(image);
            });
        })(image);

        image.onerror = (function(fn) {
            return (function() {
                reject(fn + " not found.");
            });
        })(fn);
    });
}

function loadJSON(url) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = (function() {
            if(req.status == 200) {
                try {
                    var v=JSON.parse(req.response);
                    resolve(v);
                } catch (e) {
                    reject(e);
                }
            } else {
                reject(req.statusText);
            }
        });

        req.onerror = (function() {
            reject("Network Error");
        });

        req.send();
    });
}

function base64ToUint8Array(s) {
    return Uint8Array.from(atob(s),c=>c.charCodeAt(0));
}

  function base64toArrayBuffer(s) {
    var a=atob(s);
    var b=new Uint8Array(a.length);

    for(var i=0;i<a.length;i++) {
      b[i]=a.charCodeAt(i);
    }

    return b.buffer;
  }