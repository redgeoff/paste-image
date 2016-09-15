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

PasteImage.prototype._createPasteCatcherIfNeeded = function () {
  var self = this;

  // We start by checking if the browser supports the Clipboard object. If not, we need to create a
  // contenteditable element that catches all pasted data
  if (!window.Clipboard) {
    self._pasteCatcher = document.createElement('div');

    // Firefox allows images to be pasted into contenteditable elements
    self._pasteCatcher.setAttribute('contenteditable', '');

    // We can hide the element and append it to the body,
    self._pasteCatcher.style.opacity = 0;
    document.body.appendChild(self._pasteCatcher);

    // as long as we make sure it is always in focus
    self._pasteCatcher.focus();
    document.addEventListener('click', function () {
      self._pasteCatcher.focus();
    });
  }
};

PasteImage.prototype._listenForPaste = function () {
  var self = this;

  self._createPasteCatcherIfNeeded();

  // Add the paste event listener
  window.addEventListener('paste', function (e) {
    self._pasteHandler(e);
  });
};

PasteImage.prototype._init = function () {
  this._listenForPaste();
  this._initialized = true;
};

PasteImage.prototype._pasteHandler = function (e) {
  var self = this;

  // Starting to paste image
  self.emit('pasting-image', e);

  // We need to check if event.clipboardData is supported (Chrome)
  if (e.clipboardData && e.clipboardData.items) {
    // Get the items from the clipboard
    var items = e.clipboardData.items;
    if (items) {
      // Loop through all items, looking for any kind of image
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          // We need to represent the image as a file,
          var blob = items[i].getAsFile();
          // and use a URL or webkitURL (whichever is available to the browser) to create a
          // temporary URL to the object
          var URLObj = window.URL || window.webkitURL;
          var source = URLObj.createObjectURL(blob);

          // The URL can then be used as the source of an image
          self._createImage(source);
        }
      }
    }
    // If we can't handle clipboard data directly (Firefox), we need to read what was pasted from
    // the contenteditable element
  } else {
    // This is a cheap trick to make sure we read the data AFTER it has been inserted.
    setTimeout(function () {
      self._checkInput();
    }, 1);
  }
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
