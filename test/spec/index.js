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

  var clipboardSupported = null,
    imgURL = '../browser/google.png';

  before(function () {
    // Clear any previously set listeners
    pasteImage.removeAllListeners();

    // Save so that we can fake
    clipboardSupported = pasteImage._clipboardSupported;

    // Fake
    pasteImage._clipboardSupported = function () {
      return false;
    };
  });

  after(function () {
    // Restore after any faking
    pasteImage._clipboardSupported = clipboardSupported;
  });

  // A low performance polyfill based on toDataURL as Safari and IE don't yet support canvas.toBlob
  if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      value: function (callback, type, quality) {

        var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
          len = binStr.length,
          arr = new Uint8Array(len);

        for (var i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i);
        }

        callback(new Blob([arr], {
          type: type || 'image/png'
        }));
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

  var imageURLToImage = function (url) {
    return new Promise(function (resolve) {
      var img = new Image();

      img.onload = function () {
        resolve(img);
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

  // As implemented by Chrome now and hopefully Firefox, Safari and IE in the future
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
          }, {
            type: 'not-img'
          }]
        }
      });

    }).then(function () {
      return imagePasted;
    }).then(function (args) {
      return imagesShouldEql(imgURL, args[0]);
    });
  });

  // As implemented by Firefox, Safari and IE
  it('should paste image via pasteCatcher', function () {

    var imagePasted = once(pasteImage, 'paste-image');

    return imageURLToImage(imgURL).then(function (img) {

      // Fake paste to pasteCatcher
      pasteImage._pasteCatcher.appendChild(img);

      // Fake unsupported clipboardData
      pasteImage._pasteHandler({
        clipboardData: {
          items: undefined
        }
      });

    }).then(function () {
      return imagePasted;
    }).then(function (args) {
      return imagesShouldEql(imgURL, args[0]);
    });
  });

  it('should check if clipboard supported', function () {
    // Mostly for test coverage
    pasteImage._clipboardSupported = clipboardSupported;
    pasteImage._clipboardSupported().should.eql(window.Clipboard);
  });

  it('should not create paste catcher if clipboard supported', function () {
    pasteImage._clipboardSupported = function () {
      return true;
    };
    pasteImage._createPasteCatcherIfNeeded();
  });

  it('should handle missing pasteCatcher children', function (done) {

    // Just to trigger init
    pasteImage.on('paste-image', function () {});

    // Fake unsupported clipboardData
    pasteImage._pasteHandler({
      clipboardData: {
        items: undefined
      }
    });

    // We have to wait a bit for the _checkInput to run
    setTimeout(done, 10);

  });

  it('should handle non image pasteCatcher children', function (done) {

    // Just to trigger init
    pasteImage.on('paste-image', function () {});

    var div = document.createElement('div');

    // Fake paste to pasteCatcher
    pasteImage._pasteCatcher.appendChild(div);

    // Fake unsupported clipboardData
    pasteImage._pasteHandler({
      clipboardData: {
        items: undefined
      }
    });

    // We have to wait a bit for the _checkInput to run
    setTimeout(done, 10);
  });

  it('should paste catcher focus', function () {
    // Just to trigger init
    pasteImage.on('paste-image', function () {});

    pasteImage._pasteCatcherFocus();
  });

  it('should also use wekitURL', function () {
    // Save for later
    var windowURL = window.URL;

    // Define webkitURL
    window.webkitURL = window.URL;

    // Remove window.URL
    window.URL = null;

    pasteImage._getURLObj().should.eql(window.webkitURL);

    // Restore
    window.URL = windowURL;
  });

});
