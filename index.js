'use strict';

(function () {

  var fileReader;
  var filePicker = document.getElementById('file-picker');
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var image = new Image();

  if (!FileReader || !filePicker.files) {
    alert('Sorry, you need a newer browser to use this app.');
  }

  function loadImageIntoCanvas () {
    ctx.drawImage(image, 0, 0);
  }

  function loadImageAsSrc () {
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
    fileReader.addEventListener('load', loadImageAsSrc);
    filePicker.addEventListener('change', loadFile);
    image.addEventListener('load', loadImageIntoCanvas);
  }

  init();

})();
