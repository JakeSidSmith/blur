'use strict';

(function () {

  var MENU_HEIGHT = document.getElementById('menu').getBoundingClientRect().height;
  var WORKSPACE_PADDING = 10;
  var MATCHES_WHITESPACE = /\s+/g;

  var fileReader;
  var currentTool;
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
    var x = _x;
    var y = _y;
    var w = 0;
    var h = 0;

    var wrapper = document.createElement('div');
    wrapper.className = 'blur-area';
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
      !image.src ||
      !blurAreas.length ||
      confirm('Changing the file will erase any progress you\'ve made. Are you sure you want to continue?')
    ) {
      var files = event.target.files;

      if (files && files.length) {
        fileReader.readAsDataURL(files[0]);
      }
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

  function init () {
    fileReader = new FileReader();
    fileReader.addEventListener('load', loadImageSrc);
    filePicker.addEventListener('change', loadFile);
    filePicker.addEventListener('click', blurFilePicker);
    image.addEventListener('load', loadImageIntoCanvas);
    window.addEventListener('resize', scaleCanvas);
    viewImage.addEventListener('click', openImageInNewTab);

    console.log(tools, Array.isArray(tools));

    each(tools, function (tool) {
      tool.addEventListener('click', toggleTool);
    });

    scaleCanvas();
  }

  init();

})();
