function isCanvasSupported () {
  const element = document.createElement('canvas');
  return Boolean(element.getContext && element.getContext('2d'));
}

if (!FileReader || !isCanvasSupported()) {
  alert('Sorry, you need a newer browser to use this app.');
  throw new Error('FileReader or Canvas not supported.');
}
