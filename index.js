'use strict';

(function () {

  var MENU_HEIGHT = document.getElementById('menu').getBoundingClientRect().height;
  var WORKSPACE_PADDING = 10;

  var fileReader;
  var filePicker = document.getElementById('file-picker');
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var image = new Image();

  if (!FileReader || !filePicker.files) {
    alert('Sorry, you need a newer browser to use this app.');
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

    canvas.style.width = canvasWidth + 'px';
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
    var files = event.target.files;

    if (files && files.length) {
      fileReader.readAsDataURL(files[0]);
    }
  }

  function init () {
    fileReader = new FileReader();
    fileReader.addEventListener('load', loadImageSrc);
    filePicker.addEventListener('change', loadFile);
    image.addEventListener('load', loadImageIntoCanvas);
    window.addEventListener('resize', scaleCanvas);
    scaleCanvas();
  }

  init();

})();
