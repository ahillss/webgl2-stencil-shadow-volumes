/**
 * Pointer Lock convenience library
 *
 * @author Isaac Sukin (@IceCreamYou) http://www.isaacsukin.com/
 *
 * Browser compatibility:
 * - Chrome
 *   - 16: full screen only, off by default
 *   - 21: all elements, off by default
 *   - 22: on by default
 *   - 23: <iframe sandbox="webkit-allow-pointer-lock ...">
 * - Firefox
 *   - 15: full screen only
 *   - 22: all elements
 *
 * Usage:
 * - PL.requestPointerLock(document.body, onEnter, onExit, onError) turns on
 *   pointer lock on the specified element. The callbacks have the specified
 *   element as `this` and receive the event as their only parameter. If the
 *   `onError` event parameter is undefined, pointer lock is unsupported.
 * - PL.exitPointerLock(document.body) cancels pointer lock if possible.
 * - PL.isSupported is a boolean indicating whether pointer lock is supported.
 *   Note that requestPointerLock() and exitPointerLock() check this before
 *   attempting to do anything.
 * - PL.isEnabled() returns a boolean indicating whether pointer lock is
 *   currently on.
 * - In order to use pointer lock, a `mousemove` listener should be registered
 *   that checks the `event.movementX` and `event.movementY` properties to see
 *   how far the mouse would have moved if it wasn't locked, and responds
 *   appropriately:
 *       document.addEventListener('mousemove', function(event) {
 *         moveCamera(event.movementX, event.movementY);
 *       }, false);
 */
(function() {

  var isPointerLockSupported =
    'pointerLockElement' in document ||
    'msPointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document;
  var isPointerLockEnabled = false;

  function requestPointerLock(element, onEnter, onExit, onError) {
    element = element || document.body;

    if (!isPointerLockSupported) {
      if (typeof onError === 'function') {
        onError.call(element);
      }
      return false;
    }

    var pointerlockchange = function (event) {
      if (document.pointerLockElement === element ||
          document.msPointerLockElement === element ||
          document.mozPointerLockElement === element ||
          document.webkitPointerLockElement === element) {
        if (typeof onEnter === 'function') {
          onEnter.call(element, event);
        }
        isPointerLockEnabled = true;
      }
      else {
        if (typeof onExit === 'function') {
          onExit.call(element, event);
        }
        isPointerLockEnabled = false;

        document.removeEventListener('pointerlockchange', pointerlockchange, false);
        document.removeEventListener('mspointerlockchange', pointerlockchange, false);
        document.removeEventListener('mozpointerlockchange', pointerlockchange, false);
        document.removeEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.removeEventListener('pointerlockerror', pointerlockerror, false);
        document.removeEventListener('mspointerlockerror', pointerlockerror, false);
        document.removeEventListener('mozpointerlockerror', pointerlockerror, false);
        document.removeEventListener('webkitpointerlockerror', pointerlockerror, false);
      }
    };

    var pointerlockerror = function (event) {
      if (typeof onError === 'function') {
        onError.call(element, event);
      }

      document.removeEventListener('pointerlockchange', pointerlockchange, false);
      document.removeEventListener('mspointerlockchange', pointerlockchange, false);
      document.removeEventListener('mozpointerlockchange', pointerlockchange, false);
      document.removeEventListener('webkitpointerlockchange', pointerlockchange, false);

      document.removeEventListener('pointerlockerror', pointerlockerror, false);
      document.removeEventListener('mspointerlockerror', pointerlockerror, false);
      document.removeEventListener('mozpointerlockerror', pointerlockerror, false);
      document.removeEventListener('webkitpointerlockerror', pointerlockerror, false);
    };

    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mspointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

    document.addEventListener('pointerlockerror', pointerlockerror, false);
    document.addEventListener('mspointerlockerror', pointerlockerror, false);
    document.addEventListener('mozpointerlockerror', pointerlockerror, false);
    document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

    element.requestPointerLock =
      element.requestPointerLock ||
      element.msRequestPointerLock ||
      element.mozRequestPointerLock ||
      element.webkitRequestPointerLock;

    element.requestPointerLock();

    return true;
  }

  function exitPointerLock() {

    if (!isPointerLockSupported) {
      if (window.console && console.error) {
        console.error('Error while attempting to exit pointer lock: pointer lock is not supported in this browser.');
      }
      return false;
    }

    if (!isPointerLockEnabled) {
      if (window.console && console.warn) {
        console.warn('Attempted to exit pointer lock, but pointer lock is not currently on.');
      }
      return false;
    }

    document.exitPointerLock =
      document.exitPointerLock ||
      document.msExitPointerLock ||
      document.mozExitPointerLock ||
      document.webkitExitPointerLock;

    document.exitPointerLock();

    return true;
  }

  var mouseEventPrototype = this.MouseEvent.prototype;
  if(!('movementX' in mouseEventPrototype)) {
    Object.defineProperty(mouseEventPrototype, 'movementX', {
      enumerable: true, configurable: false, writeable: false,
      get: function() {
        return this.msMovementX || this.mozMovementX || this.webkitMovementX || 0;
      }
    });
  }
  if(!('movementY' in mouseEventPrototype)) {
    Object.defineProperty(mouseEventPrototype, 'movementY', {
      enumerable: true, configurable: false, writeable: false,
      get: function() {
        return this.msMovementY || this.mozMovementY || this.webkitMovementY || 0;
      }
    });
  }

  this.PL = {
    isSupported: isPointerLockSupported,
    isEnabled: function() { return isPointerLockEnabled; },
    requestPointerLock: requestPointerLock,
    exitPointerLock: exitPointerLock,
  };

}).call(this);
