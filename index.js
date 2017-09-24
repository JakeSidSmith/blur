'use strict';

(function () {

  var MENU_HEIGHT = document.getElementById('menu').getBoundingClientRect().height;
  var WORKSPACE_PADDING = 10;
  var MATCHES_WHITESPACE = /\s+/g;

  var fileReader;
  var currentTool;
  var currentBlurArea;
  var tools = Array.prototype.slice.call(document.getElementsByClassName('tool'));
  var viewImage = document.getElementById('view-image');
  var filePicker = document.getElementById('file-picker');
  var canvasWrapper = document.getElementById('canvas-wrapper');
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var image = new Image();
  var blurAreas = [];

  if (!FileReader || !filePicker.files) {
    alert('Sorry, you need a newer browser to use this app.');
  }

  function each (arr, fn) {
    for (var i = 0; i < arr.length; i += 1) {
      fn(arr[i], i);
    }
  }

  function addClass (el, className) {
    var classNames = (el.className || '').split(MATCHES_WHITESPACE);
    classNames.push(className);

    el.className = classNames.join(' ');
  }

  function removeClass (el, className) {
    var classNames = (el.className || '').split(MATCHES_WHITESPACE);
    var index = classNames.indexOf(className);

    if (index >= 0) {
      classNames.splice(index, 1);

      el.className = classNames.join(' ');
    }
  }

  function toggleClass (el, className) {
    var classNames = (el.className || '').split(MATCHES_WHITESPACE);
    var index = classNames.indexOf(className);

    if (index >= 0) {
      classNames.splice(index, 1);
    } else {
      classNames.push(className);
    }

    el.className = classNames.join(' ');
  }

  function BlurRect (_x, _y) {
    var focused = false;
    var x = _x;
    var y = _y;
    var w = 0;
    var h = 0;

    var wrapper = document.createElement('div');
    wrapper.className = 'blur-area';

    this.updatePosition = function () {
      wrapper.style = 'width:' + (w * 100) + '%;' +
        'height:' + (h * 100) + '%;' +
        'top:' + (y * 100) + '%;' +
        'left:' + (x * 100) + '%;';
    };

    this.updateSize = function (_w, _h) {
      w = Math.max(Math.min(_w, 1), 0);
      h = Math.max(Math.min(_h, 1), 0);
      this.updatePosition();
    };

    this.blur = function () {
      removeClass(wrapper, 'active');
      focused = false;
    };

    this.focus = function () {
      addClass(wrapper, 'active');
      focused = true;
    };

    this.destroy = function () {
      wrapper.remove();
    };

    this.getPosition = function () {
      return {
        x: x,
        y: y
      };
    };

    this.updatePosition();

    canvasWrapper.appendChild(wrapper);
  }

  function scaleCanvas () {
    var canvasWidth, canvasHeight;

    var workspaceWidth = window.innerWidth - WORKSPACE_PADDING * 2;
    var workspaceHeight = window.innerHeight - MENU_HEIGHT - WORKSPACE_PADDING * 2;
    var workspaceAspect = workspaceHeight / workspaceWidth;

    var imageWidth = image.width || canvas.width;
    var imageHeight = image.height || canvas.height;

    var imageAspect = imageHeight / imageWidth;

    if (imageAspect <= workspaceAspect) {
      canvasWidth = Math.min(imageWidth, workspaceWidth);
    } else {
      canvasHeight = Math.min(imageHeight, workspaceHeight);
      canvasWidth = canvasHeight / imageAspect;
    }

    canvasWrapper.style.width = canvasWidth + 'px';
  }

  function loadImageIntoCanvas () {
    canvas.width = image.width;
    canvas.height = image.height;

    scaleCanvas();

    ctx.drawImage(image, 0, 0);
  }

  function loadImageSrc () {
    image.src = fileReader.result;
  }

  function loadFile (event) {
    if (
      (
        !image.src &&
        !blurAreas.length
      ) ||
      confirm('Changing the file will erase any progress you\'ve made. Are you sure you want to continue?')
    ) {
      var files = event.target.files;

      if (files && files.length) {
        fileReader.readAsDataURL(files[0]);
      }

      each(blurAreas, function (blurArea) {
        blurArea.destroy();
      });

      blurAreas = [];
    }
  }

  function blurFilePicker (event) {
    event.target.blur();
  }

  function openImageInNewTab (event) {
    event.target.blur();
    var preview = window.open('about:blank', '_blank');
    preview.document.write('<img src="' + canvas.toDataURL('image/png') + '" />');
  }

  function toggleTool (event) {
    var previousTool = currentTool;
    currentTool = event.target.dataset.tool;

    if (previousTool === currentTool) {
      currentTool = null;
    }


    each(tools, function (element) {
      removeClass(element, 'active');

      if (event.target.dataset.tool === currentTool) {
        addClass(element, 'active');
      }
    });
  }

  function getPositionInCanvas (event) {
    var rect = canvasWrapper.getBoundingClientRect();
    var x = event.clientX;
    var y = event.clientY;

    return {
      x: (x - rect.left) / rect.width,
      y: (y - rect.top) / rect.height
    };
  }

  function canvasMouseDown (event) {
    var previousBlurArea = currentBlurArea;

    if (currentTool === 'rectangle') {
      var pos = getPositionInCanvas(event);
      var newBlurArea = new BlurRect(pos.x, pos.y);
      currentBlurArea = newBlurArea;

      blurAreas.push(newBlurArea);
    }

    if (currentBlurArea === previousBlurArea) {
      currentBlurArea = null;
    }

    each(blurAreas, function (blurArea) {
      blurArea.blur();

      if (currentBlurArea === blurArea) {
        blurArea.focus();
      }
    })
  }

  function canvasMouseMove (event) {
    if (currentBlurArea) {
      var pos = getPositionInCanvas(event);
      var blurPos = currentBlurArea.getPosition();

      currentBlurArea.updateSize(pos.x - blurPos.x, pos.y - blurPos.y);
    }
  }

  function canvasMouseUp () {
    currentBlurArea = null;

    each(blurAreas, function (blurArea) {
      blurArea.blur();
    });
  }

  function init () {
    fileReader = new FileReader();
    fileReader.addEventListener('load', loadImageSrc);

    // File picker
    filePicker.addEventListener('change', loadFile);
    filePicker.addEventListener('click', blurFilePicker);

    // Image
    image.addEventListener('load', loadImageIntoCanvas);


    // Window
    window.addEventListener('resize', scaleCanvas);

    // Tools
    viewImage.addEventListener('click', openImageInNewTab);

    // Canvas wrapper
    canvasWrapper.addEventListener('mousedown', canvasMouseDown);
    canvasWrapper.addEventListener('mousemove', canvasMouseMove);
    canvasWrapper.addEventListener('mouseup', canvasMouseUp);

    each(tools, function (tool) {
      tool.addEventListener('click', toggleTool);
    });

    scaleCanvas();
  }

  init();

})();
