'use strict';

// NOTE: there doesn't appear to be a way to actually initiate a paste during automated browser
// testing as browsers require the user to initiate a paste. As such, we'll fake the paste and will
// have to be very careful when making changes to the code as the unit tests will not be able to
// catch all the possible problems.

var pasteImage = require('../../scripts'),
  Promise = require('bluebird');

describe('paste-image', function () {

  // // TODO: needed for saucelabs?
  // // The default of 2s is too low for IE 9
  // this.timeout(4000);

  before(function () {
    pasteImage.removeAllListeners();
  });

  var imgURL = '../browser/google.png';

  // A low performance polyfill based on toDataURL
  if (!HTMLCanvasElement.prototype.toBlob) {
   Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {

      var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
          len = binStr.length,
          arr = new Uint8Array(len);

      for (var i=0; i<len; i++ ) {
       arr[i] = binStr.charCodeAt(i);
      }

      callback( new Blob( [arr], {type: type || 'image/png'} ) );
    }
   });
  }

  var once = function (emitter, evnt) {
    return new Promise(function (resolve) {
      emitter.once(evnt, function () {
        resolve(arguments);
      });
    });
  };

  var imageURLToBlob = function (url) {
    return new Promise(function (resolve) {
      var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        img = new Image();

      img.onload = function () {
        context.drawImage(img, img.width, img.height);
        canvas.toBlob(function (blob) {
          resolve(blob);
        });
      };
      img.src = url;
    });
  };

  // To ensure that the image is being pasted properly, we'll compare dataURLs, i.e. we are
  // comparing the actual image data.
  var imageURLToDataURL = function (url) {
    return new Promise(function (resolve) {
      var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        img = new Image();

      img.onload = function () {
        context.drawImage(img, img.width, img.height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = url;
    });
  };

  var imageToDataURL = function (img) {
    var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');

    context.drawImage(img, img.width, img.height);
    return canvas.toDataURL('image/png');
  };

  var imagesShouldEql = function (img1URL, img2) {
    var img2DataURL = imageToDataURL(img2);
    return imageURLToDataURL(img1URL).then(function (img1DataURL) {
      img1DataURL.should.eql(img2DataURL);
    });
  };

  it('should paste image via clipboardData', function () {
    var imagePasted = once(pasteImage, 'paste-image'),
      blob = null;

    return imageURLToBlob(imgURL).then(function (_blob) {

      blob = _blob;

      // Fake
      pasteImage._pasteHandler({
        clipboardData: {
          items: [{
            type: 'image',
            getAsFile: function () {
              return blob;
            }
          }]
        }
      });

    }).then(function () {
      return imagePasted;
    }).then(function (args) {
      return imagesShouldEql(imgURL, args[0]);
    });
  });

  it('should paste image via pasteCatcher', function () {

  });

});
