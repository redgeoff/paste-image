'use strict';

// This code is heavily based on Joel Basada's great work at
// http://joelb.me/blog/2011/code-snippet-accessing-clipboard-images-with-javascript/

var inherits = require('inherits'),
  events = require('events');

var PasteImage = function () {
  this._initialized = false;
  this._wrapEmitterFns();
};

inherits(PasteImage, events.EventEmitter);

// We want to wrap emitter functions so that we can ensure that we have initialized the document
// listeners before listening to any paste events
PasteImage.prototype._wrapEmitterFns = function () {
  var self = this,
    fns = ['on', 'once'];

  fns.forEach(function (fn) {
    PasteImage.prototype[fn] = function () {
      if (!self._initialized) {
        self._init();
      }

      return events.EventEmitter.prototype[fn].apply(self, arguments);
    };
  });
};

PasteImage.prototype._clipboardSupported = function () {
  return window.Clipboard;
};

PasteImage.prototype._listenForClick = function () {
  var self = this;
  // Make sure it is always in focus
  document.addEventListener('click', function () {
    self._pasteCatcher.focus();
  });
};

PasteImage.prototype._createPasteCatcherIfNeeded = function () {
  // We start by checking if the browser supports the Clipboard object. If not, we need to create a
  // contenteditable element that catches all pasted data
  if (!this._clipboardSupported()) {
    this._pasteCatcher = document.createElement('div');

    // Firefox allows images to be pasted into contenteditable elements
    this._pasteCatcher.setAttribute('contenteditable', '');

    // We can hide the element and append it to the body,
    this._pasteCatcher.style.opacity = 0;
    document.body.appendChild(this._pasteCatcher);

    this._pasteCatcher.focus();
    this._listenForClick();
  }
};

PasteImage.prototype._listenForPaste = function () {
  var self = this;

  // Add the paste event listener. We ignore code coverage for this area as there does not appear to
  // be a cross-browser way of triggering a pase event
  //
  /* istanbul ignore next */
  window.addEventListener('paste', function (e) {
    self._pasteHandler(e);
  });
};

PasteImage.prototype._init = function () {
  this._createPasteCatcherIfNeeded();
  this._listenForPaste();
  this._initialized = true;
};

PasteImage.prototype._checkInputOnNextTick = function () {
  var self = this;
  // This is a cheap trick to make sure we read the data AFTER it has been inserted.
  setTimeout(function () {
    self._checkInput();
  }, 1);
};

PasteImage.prototype._pasteHandler = function (e) {
  // Starting to paste image
  this.emit('pasting-image', e);

  // We need to check if event.clipboardData is supported (Chrome)
  if (e.clipboardData && e.clipboardData.items) {
    // Get the items from the clipboard
    var items = e.clipboardData.items;

    // Loop through all items, looking for any kind of image
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        // We need to represent the image as a file,
        var blob = items[i].getAsFile();
        // and use a URL or webkitURL (whichever is available to the browser) to create a
        // temporary URL to the object
        var URLObj = this._getURLObj();
        var source = URLObj.createObjectURL(blob);

        // The URL can then be used as the source of an image
        this._createImage(source);
      }
    }
    // If we can't handle clipboard data directly (Firefox), we need to read what was pasted from
    // the contenteditable element
  } else {
    this._checkInputOnNextTick();
  }
};

PasteImage.prototype._getURLObj = function () {
  return window.URL || window.webkitURL;
};

// Parse the input in the paste catcher element
PasteImage.prototype._checkInput = function () {
  // Store the pasted content in a variable
  var child = this._pasteCatcher.childNodes[0];

  // Clear the inner html to make sure we're always getting the latest inserted content
  this._pasteCatcher.innerHTML = '';

  if (child) {
    // If the user pastes an image, the src attribute will represent the image as a base64 encoded
    // string.
    if (child.tagName === 'IMG') {
      this._createImage(child.src);
    }
  }
};

// Creates a new image from a given source
PasteImage.prototype._createImage = function (source) {
  var self = this,
    pastedImage = new Image();

  pastedImage.onload = function () {
    // You now have the image!
    self.emit('paste-image', pastedImage);
  };
  pastedImage.src = source;
};

module.exports = new PasteImage();
