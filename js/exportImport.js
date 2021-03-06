function exportToJSON() {
  var foo = [];
  foo.push({name: 'shapeParams', data: shapeParams});
  foo.push({name: 'cameraParams', data: cameraParams});
  foo.push({name: 'materialParams', data: materialParams});
  foo.push({name: 'transformParams', data: transformParams});
  foo.push({name: 'transforms', data: transforms});
  window.prompt("Copy to clipboard: Ctrl+C, Enter.", JSON.stringify(foo));
}

var foo;

function merge(a, b) {
  for (var i in b) {
    a[i] = b[i];
  }
}

function importFromJSON() {
  var inString = window.prompt("Paste JSON, Enter.", '');
  foo = JSON.parse(inString);
  
  for (var i in foo) {
    var group = foo[i];
    switch (group.name) {
      case 'shapeParams':
        merge(shapeParams, group.data);
      break;
      case 'cameraParams':
        merge(cameraParams, group.data);
      break;
      case 'materialParams':
        merge(materialParams, group.data);
      break;
      case 'transformParams':
        merge(transformParams, group.data);
      break;
      case 'transforms':
        transforms = group.data.slice();
      break;
    }
  }
  resetWorker(shapeParams.resolution);
  updateMaterial();
  updateBackground();
}

function dataURLToBlob(dataURL) {
	var BASE64_MARKER = ';base64,';
	if (dataURL.indexOf(BASE64_MARKER) == -1) {
		var parts = dataURL.split(',');
		var contentType = parts[0].split(':')[1];
		var raw = decodeURIComponent(parts[1]);

		return new Blob([raw], {type: contentType});
	}

	var parts = dataURL.split(BASE64_MARKER);
	var contentType = parts[0].split(':')[1];
	var raw = window.atob(parts[1]);
	var rawLength = raw.length;

	var uInt8Array = new Uint8Array(rawLength);

	for (var i = 0; i < rawLength; ++i) {
		uInt8Array[i] = raw.charCodeAt(i);
	}

	return new Blob([uInt8Array], {type: contentType});
}

function getScreenshotNumber() {
  if (typeof ssNum == 'undefined') {
    this.ssNum = 0;
  } else {
    ssNum++;
  }
  return padWithZeros(ssNum);
}

function padWithZeros(s) {
  var out = s.toString();
  if (s < 100000) {
    out = '0' + out;
    if (s < 10000) {
      out = '0' + out;
      if (s < 1000) {
        out = '0' + out;
        if (s < 100) {
          out = '0' + out;
          if (s < 10) {
            out = '0' + out;
          }
        }
      }
    }
  }
  return out;
}

function takeScreenshot() {
  saveAs(dataURLToBlob(renderer.domElement.toDataURL('image/png')), "IsoVis" + getScreenshotNumber() + ".png");
}

function makeGIF() {
  if (typeof this.frameNumber == 'undefined') {
    this.frameNumber = startFrame;
  } else {
    this.frameNumber++;
  }
  if (doneWithGIF) {
    frameNumber = 'undefined';
    makingGIF = false;
    return;
  }
  var dURL = renderer.domElement.toDataURL('image/png');
  var blob = dataURLToBlob(dURL);
  saveAs(blob, "IsoVis_frame" + padWithZeros(frameNumber) + ".png");

  waitingForNextFrame = true;
  setTimeout(doNextFrame, 5000);
}

function doNextFrame() {
  frame(frameNumber);
  talkToWorker('coords');
  waitingForNextFrame = false;
}

function frame(f) {
  if (f<=90) {
    var t = f - 0;
    transforms[0].degrees = t;
  } else if (t<=180) {
    var t = f - 90;
    transforms[1].degrees = 0.5 * t;
  } else if (t<=270) {
    var t = f - 180;
    transforms[0].degrees = 90 - t;
  } else if (t<=360) {
    var t = f - 270;
    transforms[1].degrees = 0.5 * t;
  } else {
    this.doneWithGIF = true;
  }
}

function startGIF() {
  camera.position.x = 13.801932541815242;
  camera.position.y = 8.67053362580356;
  camera.position.z = 12.602896281212557;
  cameraParams.speed = 0;
  cameraParams.radius = 0;
  makingGIF = true;
  doneWithGIF = false;
  //console.alert('You must configure this feature manually.\nConsult github.com/csp256/IsoVis for documentation.');
}
